import { DataSource, In, Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Student } from '../Entities/student.entity';
import { DocumentRequirementService } from '../../document-requirement/document-requirement.service';
import { Category, UserCategory } from 'src/document-requirement/Entities/Category.entity';
import { StudentDepartment } from 'src/document-requirement/Entities/Department.entity';
import { academicSession } from 'src/session/Entities/Academic-Session.entity';
import { registeredStudent, Status } from 'src/session/Entities/Registration.entity';
import { DocsRequirement } from 'src/document-requirement/Entities/docsRequiement.entity';
import { documentUploads, uploadStatus } from 'src/session/Entities/Student-Uploads.entity';
import { studentDashboardDto } from '../Dto/create-student.dto';
import { Notification } from 'src/session/Entities/Notification.entity';

@Injectable()
export class studentRepository extends Repository<Student> {
    constructor(
        @InjectRepository(StudentDepartment) private readonly studentDepartmentRepo: Repository<StudentDepartment>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(academicSession) private readonly sessionRepo: Repository<academicSession>,
        @InjectRepository(registeredStudent) private readonly regRepo: Repository<registeredStudent>,
        @InjectRepository(DocsRequirement) private readonly docReq: Repository<DocsRequirement>,
        @InjectRepository(documentUploads) private readonly docUploads: Repository<documentUploads>,
        @InjectRepository(Notification) private readonly notice: Repository<Notification>,
        private readonly docReqService: DocumentRequirementService,
        readonly dataSource: DataSource, 
    ) {
        super(Student, dataSource.createEntityManager());
    }

    // Logic to get student Id and Session upon login
    async studentLogin(userId: number, currentSession: string) {
        const student = await this.createQueryBuilder('student')            
            .leftJoin('student.user', 'user')
            .leftJoinAndSelect('student.dept', 'dept')
            .where('user.id = :userId', { userId })
            .getOne();

        if(!student) {
            throw new BadRequestException('Student not found');
        }

        //If the student category has been determined for the current session -> reuse the stored data
        if(student.categoryId && student.academicSession === currentSession) {
            const requiredDocs = await this.docReqService.getRequiredDocsByCategory(student.categoryId);
            return { student, requiredDocs, categoryCached: true };
        }

        const category = await this.determineCategory(student.level, student.mode_of_entry, student.dept.id);

        if(!category) {
            throw new BadRequestException('Unable to determine student category');
        }

        //update the student record once the category is fetched
        await this.update(student.id, {
            categoryId: category.id,
            academicSession: currentSession,
        });

        const requiredDocs = await this.docReqService.getRequiredDocsByCategory(category.id);
        return {
            student: { ...student, categoryId: category.id, academicSession: currentSession},
            requiredDocs,
            categoryCached: false,
        };
    }

    //Logic to get the category of the student
    private async determineCategory(level: number, modeofentry: string, deptId: number) {
        const department = await this.studentDepartmentRepo.findOne({
            where: {id: deptId},
        });

        if(!department) {
            throw new BadRequestException('Student department not found');
        }

        const maxLevel = department.max_level;
        let categoryName: string;

        if((level === 100 && modeofentry === 'Utme') || (level === 200 && ['Direct Entry', 'Transfer'].includes(modeofentry))){
            categoryName = 'fresher';
        } else if (level === maxLevel){
            categoryName = 'finalist';
        } else {
            categoryName = 'returning';
        }

        //the logic gets the category name from the Category entity in the Document Module
        return this.categoryRepo.findOne({where: {name: categoryName as UserCategory}})
    }

    //Logic that fetches information dynamically on the student dashboard
    async studentDashboardOverview(studentId: number): Promise<studentDashboardDto> {
        //comeback and explain the array distructuring.
       const [student, activeSession] = await Promise.all([
        this.findOne({ where: {user: {id: studentId} }, relations: ['user'] }),
        this.sessionRepo.findOne({ where: {isActive: true} }),
       ]);

       if (!student) throw new NotFoundException('Student not found');

       //Default values if is no active session yet
       let sessionName: string = "N/A";
       let registrationStatus: Status = Status.NOT_ASSIGNED;
       const studentName: string = student.user.firstName;
       let docsRequiredCount: number = 0;
       let docsUploadedCount: number = 0;
       let docsApprovedCount: number = 0; //you'll need to add this to the student UI design
       let getUnreadNotifications: { data: Notification[]; count: number; } = { data: [], count: 0};
       let registrationCompletion = await this.regRepo.count({
            where: { 
                student: { id: student.id }, 
                status: Status.COMPLETED
        }});         
       
       if (activeSession) {
            sessionName = activeSession.sessionId;
            registrationCompletion = await this.regRepo.count({
            where: { 
                student: { id: student.id }, 
                status: Status.COMPLETED
            }});
            
            //determines if a student has a registration record, if YES it fetches the Status
            const registration = await this.regRepo.findOne({ 
                where: {
                    student: { id: student.id },
                    acadSession: { id: activeSession.id }
                }, relations: ['student']           
            });

            if (registration) {
                registrationStatus = registration.status;

                //get the count of uploaded documents EXCLUDING docs with rejected status
                docsUploadedCount = await this.docUploads.count({
                    where: {
                        registration: { id: registration?.id },
                        status: In(['Pending', 'Approved']),
                    },
                });

                //get the count of the approved documents out of the documents the student uploaded
                docsApprovedCount = await this.docUploads.count({
                    where: {
                        registration: { id: registration?.id },
                        status: uploadStatus.APPROVED,
                    },
                });

                //get the notification messages for a student                
                getUnreadNotifications = await this.getNotifications(student.id);

                const stuCategoryId = registration?.student.categoryId;
                if(!stuCategoryId) throw new BadRequestException("Student category missing");
                //get the count of the required documents a students need to upload based on their category
                docsRequiredCount = await this.docReq.count({
                    where: {
                        docsMapCategory: {
                            category: { id: stuCategoryId }
                        } 
                    },
                    relations: ['docsMapCategory', 'docsMapCategory.category'],
                });
                            
            } else { registrationStatus = Status.NOT_STARTED }; //assign the default if no registration record yet            
        }
       
       return {
        studentName: studentName,
        academicSession: sessionName,
        registrationStatus: registrationStatus,
        registrationCompletedCount: registrationCompletion,
        documentsRequiredCount: docsRequiredCount,
        documentsUploadedCount: docsUploadedCount,
        documentsApprovedCount: docsApprovedCount,
        getNotifications: getUnreadNotifications
       };
    }

    //Helper to fetch only UNREAD notifications of the logged-in student
    async getNotifications(studentId: number): Promise<{ data: Notification[]; count: number }> {    
        const notifications = await this.notice.find({
            where: {
                student: { id: studentId },
                isRead: false,
            }, order: { createdAt: 'DESC' },
        });
        
        return {
        data: notifications,
        count: notifications.length, 
        };
    }

}