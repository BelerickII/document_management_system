import { Student } from "src/user/Entities/student.entity";
import { academicSession } from "./Academic-Session.entity";
import { documentUploads } from "./Student-Uploads.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum Status{
    PENDING = 'Pending',
    COMPLETED = 'Completed',
    FAILED = 'Failed'
}

@Entity('registration')
@Unique(['studentID', 'sessionID'])
export class registeredStudent {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (studentID) => studentID.registration)
    studentID: number;
    
    @ManyToOne(() => academicSession, (sessionID) => sessionID.registration)
    sessionID: number;

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
    dateRegistered: Date;

    @ManyToOne(() => academicSession, (acadSession) => acadSession.registration)    
    acadSession: academicSession;

    @ManyToOne(() => Student, (student) => student.registration)    
    student: Student;

    @OneToMany(() => documentUploads, (upload) => upload.registration)
    upload: documentUploads[];
}