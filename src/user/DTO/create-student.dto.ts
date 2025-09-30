import { UserRole } from "../entities/user.entity";
import { IsEnum, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';
import { ModeOfEntry } from '../entities/student.entity';

export class CreateStudentDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;   
    
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole = UserRole.STUDENT;

    @IsNotEmpty()
    @IsEnum(ModeOfEntry)
    mode_of_entry: ModeOfEntry;

    @IsNotEmpty()    
    matric_no: number;

    @IsNotEmpty()
    @IsNumber()
    level: number;

    @IsNotEmpty()
    department: string;
}