import { UserRole } from "../Entities/user.entity";
import { IsEnum, IsNotEmpty, IsNumber, IsEmail, IsBoolean, IsString } from 'class-validator';
import { Department, ModeOfEntry } from '../Entities/student.entity';

export class CreateStudentDto {
    @IsNotEmpty()
    @IsNumber()
    matric_no: number;    
    
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
    @IsBoolean()
    mustResetPassword: string;

    @IsNotEmpty()
    @IsBoolean()
    isActive: string;
    
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
    @IsNumber()
    level: number;

    @IsNotEmpty()
    @IsBoolean()
    graduated: boolean;
}