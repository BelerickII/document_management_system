import { ChildEntity, Column } from "typeorm";
import { User, UserRole } from "./user.entity";

@ChildEntity(UserRole.FACULTY)
export class FacultyStaff extends User {
    @Column({
        type: "string",        
        unique: true,
        nullable: false
    })
    staffID: string;
}