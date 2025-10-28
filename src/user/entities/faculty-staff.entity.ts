import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { documentUploads } from "src/session/Entities/Student-Uploads.entity";

@Entity()
export class FacultyStaff {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.staff)
    @JoinColumn()
    user: User;

    @OneToMany(() => documentUploads, (document) => document.staff)
    document: documentUploads;

    @Column({
        type: "varchar",        
        unique: true,
        nullable: false
    })
    staffID: string;
    
}