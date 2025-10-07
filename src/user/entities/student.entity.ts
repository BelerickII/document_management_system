import { ChildEntity, Column } from "typeorm";
import { User, UserRole } from "./user.entity";

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

@ChildEntity(UserRole.STUDENT)
export class Student extends User {    
    @Column({
        type: "string",        
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