import { Column, Entity, OneToOne, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { Student } from "./student.entity";
import { FacultyStaff } from "./faculty-staff.entity";

export enum UserRole {
    STUDENT = 'student',
    FACULTY = 'faculty',
    ADMIN = 'admin',
}

// @TableInheritance({ column: { type: 'enum', name: 'role', enum: UserRole }})
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: "varchar",
        length: 100,
        nullable: false,        
    })    
    firstName: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: false, 
    })
    lastName: string;
    
    @Column({
        type: "varchar",
        length: 100,
        nullable: false, 
        unique: true,
    })
    email: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: false, 
        select: false,
    })
    password: string;

    @Column({
        type: 'date',
        nullable: false,
        default: () => 'CURRENT_DATE'
    })
    createdAt: Date;

    @Column({
        type: "boolean",
        nullable: false
    })
    isActive: Boolean;

    @Column({
        type: "boolean",
        nullable: false,
        select: false,
    })
    mustResetPassword: boolean;

    @Column({
        type: 'timestamp',        
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    lastPasswordReset?: Date;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.ADMIN,
    })
    role: UserRole;
    
    //It's optional to include this reverse relationship. If terminal throws error remove it.
    @OneToOne(() => Student, (student) => student.user, {cascade: true, onDelete: 'CASCADE'})
    student: Student;

    @OneToOne(() => FacultyStaff, (staff) => staff.user, {cascade: true, onDelete: 'CASCADE'})
    staff: FacultyStaff;
}