import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import path from 'path';

import { Student } from 'src/user/Entities/student.entity';
import { academicSessionDto, uploadDocDto } from './Dto/create-session.dto';
import { academicSession } from './Entities/Academic-Session.entity';
import { documentUploads, uploadStatus } from './Entities/Student-Uploads.entity';
import { DocsRequirement } from 'src/document-requirement/Entities/docsRequiement.entity';
import { registeredStudent, Status } from './Entities/Registration.entity';
import { SseService } from 'src/sse/sse.service';
import { Notification } from './Entities/Notification.entity';
import { staffRepository } from 'src/user/Repositories/faculty-staff.repository';

@Injectable()
export class SessionService {
 constructor (
        private readonly dataSource: DataSource,
        private readonly sseService: SseService,
        private readonly staffRepo: staffRepository,
        @InjectRepository(Notification) private readonly notice: Repository<Notification>,
        @InjectRepository(documentUploads) private readonly uploads: Repository<documentUploads>,
        @InjectRepository(academicSession) private readonly acadSession: Repository<academicSession>,
    ) {}

    //Logic to create an academic session by the admin
    async newSession(dto: academicSessionDto): Promise<{ message: string }> {
        try {
            //Trim spaces in strings
            for (const key in dto) {
                if (typeof dto[key] === 'string') dto[key] = dto[key].trim();
            }

            //Check for existing academic session by Id
            const existing = await this.acadSession.findOne({
                where: {sessionId: dto.sessionId},
            });

            if (existing){
                throw new BadRequestException(`${dto.sessionId} session already exists`)
            }

            //Check if there's an active session
            const atvSession = await this.acadSession.findOne({
                where: { isActive: true},
            });

            if(atvSession) {
                throw new BadRequestException(`Cannot create a new session while ${atvSession.sessionId} is still active`);
            }

            //create session record in DB
            const session = this.acadSession.create({
                sessionId: dto.sessionId,
                isActive: true,
            });

            await this.acadSession.save(session);
            
            return {message: 'Session created successfully'};

        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to create Academic Session')
        }
    }

    //Logic to deactivate an academic session by the admin
    async purgeSession(): Promise<{ message: string; }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
           // 1️⃣ Find active session
           const atvSession = await queryRunner.manager.findOne(academicSession, {
            where: { isActive: true },
            });

            if (!atvSession) {
                throw new BadRequestException('No active academic session found');
            }

            // 2️⃣ Deactivate the session
            atvSession.isActive = false;
            atvSession.endDate = new Date();
            console.log(atvSession.endDate);
            await queryRunner.manager.save(academicSession, atvSession);

            // 3️⃣ Fetch students with department info
            const students: Student[] = await queryRunner.manager.find(Student , {
                relations: ['dept'],
            });

            // 4️⃣ Increment levels appropriately
            for (const student of students) {
                const currentLevel = student.level;
                const maxLevel = student.dept?.max_level;

                if(currentLevel < maxLevel) {
                    student.level = currentLevel + 100;                    
                }else if (currentLevel == maxLevel) {
                    student.graduated = true;
                }

                await queryRunner.manager.save(Student, student)
            }

            // 5️⃣ Fetch registration records and change the status from "ONGOING" -> "FAILED"
            const registration: registeredStudent[] = await queryRunner.manager.find(registeredStudent, {
                where: { status: Status.ONGOING }
            });

            for (const reg of registration) {
                reg.status = Status.FAILED;

                await queryRunner.manager.save(registeredStudent, reg);
            }

            
            await queryRunner.commitTransaction();

            return {
                message: `Academic session ${atvSession.sessionId} closed successfully`,
            };        
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(error.message || 'Failed to close current session');
        }finally {
            await queryRunner.release();
        }
    }

    //Logic that handles the document student upload
    async docUpload(file: Express.Multer.File, dto: uploadDocDto) {
        if(!file) throw new BadRequestException('No file uploaded');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
               
        try {
            //1️⃣ Looking for the active academic session
            const atvSession = await queryRunner.manager.findOne(academicSession, { where: {isActive: true}});
            if(!atvSession) throw new BadRequestException('No active academic session');

            //2️⃣ Automatically get the student Id from the response the frontend sends
            const student = await queryRunner.manager.findOne(Student, { where: {id: dto.stuId}});
            if(!student) throw new BadRequestException('Student not found');

            //3️⃣ Gets the Id of the document type they upload to have a clean relation on the DB
            const docReq = await queryRunner.manager.findOne(DocsRequirement, { where: {id: dto.docReqId}});
            if(!docReq) throw new BadRequestException('Document Requirement not found');

            /*4️⃣ find or create registration record (first section makes sure a registration record for 
            a student is not existing; if it is attach the current and subsequent uploads to it)*/
            let registration = await queryRunner.manager.findOne(registeredStudent, {
                where: {
                    student: { id: student.id },
                    acadSession: { id: atvSession.id },
                },
                relations: ['acadSession', 'student'],
            });

            if(registration){
                console.log(`Exisiting registration found: ${registration.id}`);
            } else {
                registration = queryRunner.manager.create(registeredStudent, {
                    student: student,
                    acadSession: atvSession,
                    status: Status.ONGOING,                
                });
                registration = await queryRunner.manager.save(registeredStudent, registration);
            }
            
            //5️⃣ save file path and create upload record on DB
            const filePath = path.join('uploads', file.filename);
                        
            const upload = queryRunner.manager.create(documentUploads, {
                fileName: file.originalname, // dec 19th, 2025
                filePath,                
                documentType: dto.documentType,                
                uploadDate: new Date(),
                status: uploadStatus.PENDING,
                student,
                docReq,
                registration
            });
            
            const savedUpload = await queryRunner.manager.save(documentUploads, upload);
            /*Making use of nullish coalescing operator to check the values of selected property(ies) 
            from left to right and assigns the value that is not null or undefined to the variable*/
            // const stuCategoryId = student.categoryId ?? null;

            ///SSE to frontend to mutate upload row records on student facing app
            this.sseService.emitDocumentUpdate({
                studentId: student.id,
                sessionId: atvSession.id,
                payload: {
                    documentTypeId: savedUpload.documentType,
                    fileName: savedUpload.fileName,
                    status: savedUpload.status,
                },
            });

            await queryRunner.commitTransaction();
            await this.staffRepo.checkAndNotifyStaff();
            return savedUpload;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message || 'Failed to upload document');
        } finally {
            await queryRunner.release();
        }
    }

    //Logic that handles student document reupload
    async stuReupload(file: Express.Multer.File, documentId: number, studentId: number): Promise<{message: string;}> {
        if(!file) throw new BadRequestException('No file uploaded');

        const existingDoc = await this.uploads.findOne({ where: { id: documentId, status: uploadStatus.REJECTED, student: {id: studentId} }});

        if (!existingDoc) throw new BadRequestException('Rejected document not found');

        //Overwrite the existing record
        existingDoc.fileName = file.filename;
        existingDoc.filePath = `uploads/${file.filename}`;
        existingDoc.status = uploadStatus.PENDING;
        existingDoc.Comment = null;
        existingDoc.uploadDate = new Date();
        existingDoc.reviewDate = null;
        existingDoc.staff = null;

        await this.uploads.save(existingDoc);

        return { message: 'Document sucessfully overwritten' };
    }

    //Logic that marks a single notification as read
    async markAsRead(notificationId: number, studentId: number) {
        const notification = await this.notice.findOne({
            where: {
                id: notificationId, 
                student: { user: {id: studentId} }
            },
        });
        if(!notification) throw new NotFoundException('Notification not found');

        notification.isRead = true;
        return this.notice.save(notification);
    }

    //Logic that marks all notifications as read
    async markAllAsRead(studentId: number) {
        await this.notice.update(
            { student: { user: {id: studentId} }, isRead: false},
            { isRead: true } 
        );
        return { success: true };
    }
}
