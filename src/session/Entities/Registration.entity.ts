import { Student } from "src/user/Entities/student.entity";
import { academicSession } from "./Academic-Session.entity";
import { documentUploads } from "./Student-Uploads.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum Status{
    PENDING = 'Pending',
    COMPLETED = 'Completed',
    FAILED = 'Failed'
}

@Entity('registration')
@Unique(['student', 'acadSession'])
export class registeredStudent {
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
        nullable: true,
        // default: () => 'CURRENT_DATE',
        onUpdate: 'CURRENT_DATE'
    })
    dateRegistered: Date | null;

    @ManyToOne(() => academicSession, (acadSession) => acadSession.registration)    
    acadSession: academicSession;

    @ManyToOne(() => Student, (student) => student.registration)    
    student: Student;

    @OneToMany(() => documentUploads, (upload) => upload.registration)
    upload: documentUploads[];
}