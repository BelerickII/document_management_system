import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "src/user/Entities/student.entity";
import { registeredStudent } from "./Registration.entity";
import { FacultyStaff } from "src/user/Entities/faculty-staff.entity";
import { DocsRequirement } from "src/document-requirement/Entities/docsRequiement.entity";

export enum Status {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

@Entity('student_uploads')
export class documentUploads {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: 'varchar',
        nullable: false
    })
    documentType: string;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 250,
    })
    filePath: string;

    @Column({
        type: 'enum',
        enum: Status,
        nullable: false,
        default: Status.PENDING
    })
    status: Status;

    @Column({
        type: 'date',
        nullable: false,
        default: () => 'CURRENT_DATE'
    })
    uploadDate: Date;

    @Column({
        type: 'date',        
        // default: () => 'CURRENT_DATE',
        nullable: true,
        onUpdate: 'CURRENT_DATE'
    })
    reviewDate?: Date;

    @Column({
        type: 'varchar',
        length: 400,
        nullable: true,
    })
    Comment?: string;

    @ManyToOne(() => Student, (student) => student.docUpload)    
    student: Student;

    @ManyToOne(() => registeredStudent, (registration) => registration.upload)    
    registration: registeredStudent;

    @ManyToOne(() => FacultyStaff, (staff) => staff.document)
    staff: FacultyStaff;

    @ManyToOne(() => DocsRequirement, (docReq) => docReq.document)
    docReq: DocsRequirement;
}