import { Student } from "src/user/Entities/student.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { registeredStudent } from "./Registration.entity";
import { FacultyStaff } from "src/user/Entities/faculty-staff.entity";
import { DocsRequirement } from "src/document-requirement/Entities/docsRequiement.entity";

export enum Status {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected'
}

@Entity('student_uploads')
export class documentUploads {
    @PrimaryGeneratedColumn()
    id: number;
    
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
        nullable: false,
        default: () => 'CURRENT_DATE'
    })
    reviewDate: Date;

    @Column({
        type: 'varchar',
        length: 400,
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