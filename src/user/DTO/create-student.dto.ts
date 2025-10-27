import { UserRole } from "../Entities/user.entity";
import { IsEnum, IsNotEmpty, IsEmail, IsString, IsNumberString, IsInt } from 'class-validator';
import { ModeOfEntry } from '../Entities/student.entity';
import { Type } from "class-transformer";
import { Department } from "../Entities/enum";

export class CreateStudentDto {
    @IsNotEmpty()
    @IsNumberString()
    matric_no: string;    
    
    @IsEmail()
    @IsNotEmpty()
    email: string;    
    
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;
    
    @IsNotEmpty()
    @IsString()
    password: string;
    
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole = UserRole.STUDENT;
    
    @IsNotEmpty()
    @IsEnum(Department)
    department: Department;
    
    @IsNotEmpty()
    @IsEnum(ModeOfEntry)
    mode_of_entry: ModeOfEntry; 

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    level: number;
}