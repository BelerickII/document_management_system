import { UserRole } from "../Entities/user.entity";
import { IsEnum, IsNotEmpty, IsNumber, IsEmail, IsBoolean, IsString } from 'class-validator';
import { ModeOfEntry } from '../Entities/student.entity';

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
    @IsEnum(UserRole)
    role: UserRole = UserRole.STUDENT;
    
    @IsNotEmpty()
    @IsString()
    department: string;
    
    @IsNotEmpty()
    @IsEnum(ModeOfEntry)
    mode_of_entry: ModeOfEntry; 

    @IsNotEmpty()
    @IsNumber()
    level: number;

    @IsBoolean()
    graduated: boolean;
}