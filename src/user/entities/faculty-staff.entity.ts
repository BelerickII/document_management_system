import { Check, ChildEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User, UserRole } from "./user.entity";

@Entity()
export class FacultyStaff {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.staff, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn()
    user: User;

    @Column({
        type: "varchar",        
        unique: true,
        nullable: false
    })
    staffID: string;
    
}