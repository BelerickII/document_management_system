import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";

export enum UserRole {
    STUDENT = 'student',
    FACULTY = 'faculty',
    ADMIN = 'admin',
}

@Entity("users")
@TableInheritance({ column: { type: 'enum', name: 'role', enum: UserRole } })
export abstract class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: "varchar",
        length: 150,
        nullable: false,        
    })    
    firstName: string;

    @Column({
        type: "varchar",
        length: 150,
        nullable: false, 
    })
    lastName: string;
    
    @Column({
        type: "varchar",
        length: 150,
        nullable: false, 
        unique: true,
    })
    email: string;

    @Column({
        type: "varchar",
        length: 150,
        nullable: false, 
    })
    password: string;

  @Column({
        type: "boolean",
        nullable: false
    })
    isActive: Boolean;

    @Column({
        type: "boolean",
        nullable: false,
    })
    mustResetPassword: boolean;

    @Column({
        // type: "enum",
        // enum: UserRole,
        default: UserRole.ADMIN,
    })
    role: UserRole;
}