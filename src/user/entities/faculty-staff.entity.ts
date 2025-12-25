import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { documentUploads } from "src/session/Entities/Student-Uploads.entity";
import { Notification } from "src/session/Entities/Notification.entity";

@Entity()
export class FacultyStaff {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.staff)
    @JoinColumn()
    user: User;

    @OneToMany(() => documentUploads, (document) => document.staff)
    document: documentUploads[];

    @OneToMany(() => Notification, (notifications) => notifications.staff)
    notifications: Notification[];

    @Column({
        type: "varchar",        
        unique: true,
        nullable: false
    })
    @Index()
    staffID: string;
    
}