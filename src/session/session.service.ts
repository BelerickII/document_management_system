import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';

import { Student } from 'src/user/Entities/student.entity';
import { academicSessionDto, uploadDocDto } from './Dto/create-session.dto';
import { academicSession } from './Entities/Academic-Session.entity';
import { documentUploads, Status } from './Entities/Student-Uploads.entity';
import { studentRepository } from 'src/user/Repositories/student.repository';
import { DocsRequirement } from 'src/document-requirement/Entities/docsRequiement.entity';

@Injectable()
export class SessionService {
 constructor (
        private readonly dataSource: DataSource,
        private readonly studentRepo: studentRepository,
        @InjectRepository(DocsRequirement) private readonly docReq: Repository<DocsRequirement>,
        @InjectRepository(academicSession) private readonly acadSession: Repository<academicSession>,
        @InjectRepository(documentUploads) private readonly docUploads: Repository<documentUploads>
    ) {}

    //Logic to create an academic session by the admin
    async newSession(dto: academicSessionDto): Promise<academicSession> {
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
                throw new BadRequestException(`Student with matric number ${dto.sessionId} already exists`)
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

            return await this.acadSession.save(session);

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

            // 5️⃣ Commit the transaction
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
    async docUpload(file: Express.Multer.File, dto: uploadDocDto): Promise<documentUploads> {
        try {
            if(!file) throw new BadRequestException('No file uploaded');
            
            //validate file type
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException('invalid file type; only JPEG, PNG & PDF allowed');
            }
            
            //validate file size (max 10mb)
            const maxSize = 8 * 1024 *1024;
            if (file.size > maxSize) {
                throw new BadRequestException('file is too large!, Max 8mb');
            }

            //Automatically get the student Id from the response the frontend sends
            const student = await this.studentRepo.findOne({ where: {id: dto.stuId}});
            if(!student) throw new BadRequestException('Student not found');

            //Gets the Id of the document type they upload to have a clean relation on the DB
            const docReq = await this.docReq.findOne({ where: {id: dto.docReqId}});
            if(!docReq) throw new BadRequestException('Document Requirement not found');
            
            const filePath = path.join('uploads', file.fieldname);
            
            const upload = this.docUploads.create({
                filePath,                
                documentType: dto.documentType,                
                uploadDate: new Date(),
                status: Status.PENDING,
                student,
                docReq
            });
            
            return await this.docUploads.save(upload);

        } catch (error) {
            throw new BadRequestException(error.message) || 'Failed to upload document'
        }
    }
}
