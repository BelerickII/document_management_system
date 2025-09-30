import { ChildEntity, Column } from "typeorm";
import { User, UserRole } from "./user.entity";

@ChildEntity(UserRole.FACULTY)
export class FacultyStaff extends User {
    @Column({
        type: "int",        
        unique: true,
        nullable: false
    })
    staffID: number;
}