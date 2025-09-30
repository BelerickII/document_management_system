import { ChildEntity, Column } from "typeorm";
import { User, UserRole } from "./user.entity";

export enum ModeOfEntry {
    UTME = 'Utme',
    TRANSFER = 'Transfer',
    DIRECT_ENTRY = 'Direct Entry',
}

@ChildEntity(UserRole.STUDENT)
export class Student extends User {    
    @Column({
        type: "int",        
        unique: true,
        nullable: false
    })
    matric_no: number; 
    
    @Column({
        type: "varchar",
        length: 100,
        nullable: false,
    })
    department: string;

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
}