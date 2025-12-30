import { DataSource, In, Repository } from "typeorm";
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { documentGateway } from "../Others/staff.gateway";
import { documentUploads, uploadStatus } from "src/session/Entities/Student-Uploads.entity";
import { academicSession } from "src/session/Entities/Academic-Session.entity";
import { FacultyStaff } from "../Entities/faculty-staff.entity";
import { emailService } from "../Others/email.service";
import { registeredStudent, Status } from "src/session/Entities/Registration.entity";
import { DocsRequirement } from "src/document-requirement/Entities/docsRequiement.entity";
import { SseService } from "src/sse/sse.service";
import path from "path";
import { Notification } from "src/session/Entities/Notification.entity";
import { staffDashboardDto } from "../Dto/create-faculty-staff.dto";
import { Student } from "../Entities/student.entity";

@Injectable()
export class staffRepository extends Repository<FacultyStaff> {
    constructor(
        private dataSource: DataSource,
        private readonly gateway: documentGateway,
        private readonly mailService: emailService,
        private readonly sseService: SseService,
        @InjectRepository(Student) private readonly stu: Repository<Student>,
        @InjectRepository(academicSession) private readonly sessionRepo: Repository<academicSession>,
        @InjectRepository(Notification) private readonly notice: Repository<Notification>,
        @InjectRepository(documentUploads) private readonly docUploads: Repository<documentUploads>,
        @InjectRepository(registeredStudent) private readonly reg: Repository<registeredStudent>,
        @InjectRepository(DocsRequirement) private readonly docReq: Repository<DocsRequirement>
    ) {
        super(FacultyStaff, dataSource.createEntityManager());
    }

    private LOCK_DURATION_MS = 5 * 60 * 1000;

    //this method get all uploaded documents by student with status as "PENDING"
    async getUploadedDocs(page = 1, limit = 50) {
        const parsedPage = !isNaN(page) && page> 0 ? page: 1;
        const parsedLimit = !isNaN(limit) && limit> 0 ? limit: 50;
        
        //Make sure to fetch from the active session only
        const atvSession = await this.dataSource.getRepository(academicSession).findOne({ where: {isActive: true} });
        if(!atvSession) {
            throw new BadRequestException('No active academic session, kindly wait for a new session to be active');
        }

        //query to fetch pending uploads from documents and display to the staff
        const pendingDocs = await this.docUploads
            .createQueryBuilder('uploads')
            .leftJoinAndSelect('uploads.student', 'student')
            .leftJoinAndSelect('uploads.staff', 'staff')
            .where('uploads.status = :status', { status: 'Pending' })
            .andWhere('student.academicSession = :session', { session: atvSession.sessionId })
            .andWhere('student.academicSession IS NOT NULL')
            .select([
                'uploads.id AS id',
                'uploads.documentType  AS documentType',
                'uploads.status AS status',
                'student.matric_no AS matric_no',                               
                'uploads.filePath AS filePath'
            ]).orderBy('uploads.uploadDate', 'ASC')
            .skip((parsedPage - 1) * parsedLimit)
            .take(parsedLimit)
            .getRawMany();

        if(pendingDocs.length == 0) {
            return{
                message: `No document has been uploaded by students for ${atvSession.sessionId} academic session`,
            };
        }

        return pendingDocs;            
    }

    //this is the method that handle the view modal on the frontend application
    async lockDocument (documentId: number, staffId: number): Promise<number> {
        const doc = await this.docUploads.findOne({ where: {id: documentId } });
        if (!doc) throw new BadRequestException('Document not found');

        //if document is already in review by another staff -> deny (this will rarely happen sha)
        if (doc.lockedBy && doc.lockedBy !== staffId) {
            throw new BadRequestException('Document is currently being reviewed');
        }

        doc.lockedBy = staffId;
        doc.lockedAt = new Date();
        await this.docUploads.save(doc);

        //Broadcast lock
        this.gateway.emitDocumentLocked(doc.id, staffId);

        //sanitize the filePath from the DB
        // const fileUrl = doc.filePath.replace(/\\/g, '/'); | `/${fileUrl}`
        return doc.id;
    }

    //frontend calls this method if there's no approval within some minutes
    async unlockIfExpired(documentId: number): Promise<void> {
        const doc = await this.docUploads.findOne({ where: {id: documentId} });
        if (!doc || !doc.lockedAt) return;

        const isExpired = Date.now() - doc.lockedAt.getTime() >= this.LOCK_DURATION_MS;
        if (!isExpired) return;

        doc.lockedAt = null;
        doc.lockedBy = null;

        await this.docUploads.save(doc);
        this.gateway.emitDocumentUnlocked(documentId);
    }

    //this method streams the selected file to the frontend and allows a staff to view it
    async viewDoc(documentId: number, staffId: number): Promise<string> {
        const doc = await this.docUploads.findOne({ where: { id: documentId }, relations: ['student']});

        if(doc?.lockedBy !== staffId) {
            throw new ForbiddenException('You do not have access to this document');
        }

        const absolutePath = path.resolve(doc.filePath);
        return absolutePath;
    }

    //this method handles the approval or rejection of an uploaded document
    async reviewDocument(documentId: number, staffId: number, action: uploadStatus, comment?: string): Promise<{message: string}> {
        //get the id of the staff reviewing the document        
        const staff = await this.findOne({ where: {user: {id: staffId}} }); //Took me a while to get the right query
        if (!staff) throw new NotFoundException('Staff is not found');

        const doc = await this.docUploads.findOne({ 
            where: { id: documentId},
            relations: ['student','registration', 'registration.acadSession']
        });
        if (!doc) throw new NotFoundException('Document not found');

        //checks if the staff reviewing the document is the one that locked it (more like handling edge cases lmao)
        if (doc.lockedBy !== staffId) {
            //throw an error or allow the current staff if the lock has expired
            const lockedAt = doc.lockedAt?.getTime() ?? 0;
            if(!(doc.lockedBy === null || Date.now() - lockedAt > this.LOCK_DURATION_MS)){
                throw new BadRequestException('You are not the reviewer for this document');
            }
        }

        //update fields
        doc.staff = staff;
        doc.status = action;
        doc.reviewDate = new Date();

        //If rejected, store comment
        if (action === uploadStatus.APPROVED){
            doc.Comment = null;
        } else {
            doc.Comment = comment;
        }

        //Clear lock
        doc.lockedBy = null;
        doc.lockedAt = null;

        await this.docUploads.save(doc);

        //SSE to frontend to mutate upload row records on student facing app
        this.sseService.emitDocumentUpdate({
            studentId: doc.student.id,
            sessionId: doc.registration.acadSession.id,
            payload: {
                documentTypeId: doc.documentType,
                fileName: doc.fileName,
                status: doc.status, // APPROVED | REJECTED
            },
        });


        if (action === uploadStatus.REJECTED) {
            try {
                const stuMail = await this.getStuMail(doc.id);                
                const stuName = await this.getStuName(doc.id);
                if (stuMail) {
                    //wanna mail the student that doc has been rejected
                    await this.mailService.sendRejectionEmail(stuMail, stuName, doc.Comment || '', doc.documentType)
                } else {
                    // this.logger.warn(`No email found for studentId: ${doc.student}`);
                }
                
                //this create the notification message shown in the frontend
                const notification = this.notice.create({
                    title: `${doc.documentType} Rejected`,
                    message: `${doc.Comment}`,
                    student: doc.student,
                    createdAt: new Date(),
                    isRead: false
                });
                await this.notice.save(notification);
                
            } catch (error) {
                // this.logger.error('Failed to send rejection email: ' + error?.message);
            }

        }

        const registration = await this.reg.findOne({
            where: { id: doc.registration.id },
            relations: ['student']
        });
        await this.changeRegStatus(registration);

        return {message: 'Document reviewed successfully'};
    }

    //these functions help get the student Email & Name 
    private async getStuMail (documentId: number) {
        const result = await this.docUploads.createQueryBuilder('doc')
            .leftJoinAndSelect('doc.student', 'student')
            .leftJoinAndSelect('student.user', 'user')
            .select('user.email', 'email')
            .where('doc.id = :documentId', { documentId })
            .getRawOne();
            
            if(!result) throw new NotFoundException(`can't find the requested student email of the document with the Id: ${documentId}`);
        
        return result?.email ?? null;        
    }

    private async getStuName (documentId: number) {
        const result = await this.docUploads.createQueryBuilder('doc')
            .leftJoinAndSelect('doc.student', 'student')
            .leftJoinAndSelect('student.user', 'user')
            .select('user.firstName', 'firstName')
            .where('doc.id = :documentId', { documentId })
            .getRawOne();

            if(!result) throw new NotFoundException(`can't find the requested student name of the document with the Id: ${documentId}`);

        return result?.firstName ?? null;
    }

    //helper method to change the registration record status to "COMPLETED"
    private async changeRegStatus (registration: registeredStudent | null): Promise<void> {
        const stuCategoryId = registration?.student.categoryId;
        if(!stuCategoryId) throw new BadRequestException("Student category missing");

        //get the count of the required documents a students need to upload based on their category
        const reqDocsCount = await this.docReq.count({
            where: {
                docsMapCategory: {
                    category: { id: stuCategoryId }
                } 
            },
            relations: ['docsMapCategory', 'docsMapCategory.category'],
        });
        // console.log(reqDocsCount);

        //get the count of the approved documents a student has uploaded
        const approvedCount = await this.docUploads.count({
            where: {
                registration: { id: registration.id },
                status: uploadStatus.APPROVED,
            },
        });
        // console.log(approvedCount);

        if (approvedCount === reqDocsCount && reqDocsCount > 0) {
            registration.status = Status.COMPLETED;
            registration.dateRegistered = new Date();
        } else {
            registration.status = Status.ONGOING;
        }

        await this.reg.save(registration); //Foolish me forgot this line and was wondering what was going on lmao
    }

    //Logic to send notification batch to staffs when uploaded documents reach a threshold
    async checkAndNotifyStaff(): Promise<void> {
        const uploadCount = await this.docUploads.count({
            where: { status: uploadStatus.PENDING }
        });

        if (uploadCount > 0 && uploadCount % 115 === 0) {
            await this.sendNotificationToStaff(uploadCount);
        }
    }

    //This method is called by the method above
    private async sendNotificationToStaff(count: number): Promise<void> {
        const allStaff = await this.find();

        const notifications = allStaff.map((staff) => {
            return this.notice.create({
                title: 'Document Batch Alert',
                message: `New set of ${count} documents have been uploaded. Please review the new batch.`,
                createdAt: new Date(),
                isRead: false,
                staff: staff                
            });
        });
        await this.notice.save(notifications);
    }

    //Logic that fetches information dynamically on the staffdashboard
    async staffDashboardOverview(staffId: number): Promise<staffDashboardDto> {
        const [staff, activeSession] = await Promise.all([
        this.findOne({ where: {user: {id: staffId} }, relations: ['user'] }),
        this.sessionRepo.findOne({ where: {isActive: true} }),
       ]);

       if (!staff) throw new NotFoundException('Staff not found');

       //Default values if is no active session yet
       let sessionName: string = 'N/A'
       const staffName: string = staff.user.firstName;
       let totalDocsUploaded: number = 0;
       let totalStuRegistered: number = 0;
       let totalAtvStudent: number = 0;
       let pendingDocs: number = 0;
       let docsReviewed: number = 0;
       let getUnreadNotifications: { data: Notification[]; count: number; } = { data: [], count: 0};

       if(activeSession) {
        sessionName = activeSession.sessionId;
        getUnreadNotifications = await this.getNotifications(staff.id);
        totalDocsUploaded = await this.docUploads.count({
            where: { 
                status: In(['Approved', 'Pending']), 
                registration: { acadSession: activeSession} 
            }, relations: ['registration']
        });
        
        totalStuRegistered = await this.reg.count({
            where: {
                status: Status.COMPLETED,
                acadSession: activeSession
            }
        });

        totalAtvStudent = await this.stu.count({
            where: {
                graduated: false,
                academicSession: activeSession.sessionId,
            }
        });

        pendingDocs = await this.docUploads.count({
            where: { 
                status: uploadStatus.PENDING,
                registration: { acadSession: activeSession}
            }, relations: ['registration']
        });

        docsReviewed = await this.docUploads.count({
            where: {
                staff: staff,
                status: uploadStatus.APPROVED,
                registration: { acadSession: activeSession}
            }, relations: ['registration']
        });

       }

       return {
        staffName: staffName,
        academicSession: sessionName,
        totalDocumentsUploaded: totalDocsUploaded,
        totalStudentRegistered: totalStuRegistered,
        totalActiveStudent: totalAtvStudent,
        pendingDocument: pendingDocs,
        documentsReviewed: docsReviewed,
        getNotifications: getUnreadNotifications
       }
    }

    //Helper to fetch only UNREAD notifications of the logged-in staffs
    async getNotifications(staffId: number): Promise<{ data: Notification[]; count: number }> {    
        const notifications = await this.notice.find({
            where: {
                staff: { id: staffId },
                isRead: false,
            }, order: { createdAt: 'DESC' },
        });
        
        return {
        data: notifications,
        count: notifications.length, 
        };
    }
    
}