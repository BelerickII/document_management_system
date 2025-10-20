import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class FacultyStaff {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.staff)
    @JoinColumn()
    user: User;

    @Column({
        type: "varchar",        
        unique: true,
        nullable: false
    })
    staffID: string;
    
}