import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { StudentDepartment } from "src/document-requirement/Entities/Department.entity";
import { Department } from "./enum";
import { registeredStudent } from "src/session/Entities/Registration.entity";
import { documentUploads } from "src/session/Entities/Student-Uploads.entity";

export enum ModeOfEntry {
    UTME = 'Utme',
    TRANSFER = 'Transfer',
    DIRECT_ENTRY = 'Direct Entry',
}

@Entity()
export class Student {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.student)
    @JoinColumn()
    user: User;

    @ManyToOne(() => StudentDepartment, dept => dept.student, {nullable: false})
    @JoinColumn()
    dept: StudentDepartment;

    @OneToMany(() => registeredStudent, (registration) => registration.student)
    registration: registeredStudent[];

    @OneToMany(() => documentUploads, (docUpload) => docUpload.student)
    docUpload: documentUploads[];

    @Column({
        type: "varchar",        
        unique: true,
        nullable: false
    })
    matric_no: string; 
    
    @Column({
        type: "enum",
        enum: Department,        
        nullable: false,
    })
    department: Department;

    @Column({
        type: "int",        
        nullable: false,
    })
    level: number;

    @Column({
        type: "enum",
        enum: ModeOfEntry,
        default: ModeOfEntry.UTME,
    })
    mode_of_entry: ModeOfEntry;

    @Column({
        type: "boolean",
        nullable: false
    })
    graduated: boolean;
    
    @Column({
        nullable: true,
        type: 'int'
    })
    categoryId?: number;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    academicSession?: string;
}