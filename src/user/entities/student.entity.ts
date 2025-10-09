import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum ModeOfEntry {
    UTME = 'Utme',
    TRANSFER = 'Transfer',
    DIRECT_ENTRY = 'Direct Entry',
}

export enum Department {
    COMPUTER_SCIENCE = "Computer Science",
    SOFTWARE_ENGINEERING = "Software Engineering",
    DATA_SCIENCE = "Data Science",
    CYBERSECURITY = "Cybersecurity",
}

@Entity()
export class Student {
    @PrimaryGeneratedColumn()    
    declare id: number;
    
    @OneToOne(() => User, (user) => user.student, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn()
    user: User;

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
}