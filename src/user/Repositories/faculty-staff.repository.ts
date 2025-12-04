import { DataSource, Repository } from "typeorm";
import { FacultyStaff } from "../Entities/faculty-staff.entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { documentUploads } from "src/session/Entities/Student-Uploads.entity";
import { academicSession } from "src/session/Entities/Academic-Session.entity";

@Injectable()
export class staffRepository extends Repository<FacultyStaff> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(documentUploads) private readonly docUploads: Repository<documentUploads>,
    ) {
        super(FacultyStaff, dataSource.createEntityManager());
    }

    async getUploadedDocs(page = 1, limit = 50) {
        const parsedPage = !isNaN(page) && page> 0 ? page: 1;
        const parsedLimit = !isNaN(limit) && limit> 0 ? limit: 50;
        
        //Make sure to fetch from the active session
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

    async patchDocStatus () {
        
    }

}