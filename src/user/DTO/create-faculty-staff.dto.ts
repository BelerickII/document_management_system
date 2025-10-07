import { IsNotEmpty, IsEnum, IsEmail, IsNumber, IsString, IsBoolean, } from 'class-validator';
import { UserRole } from '../Entities/user.entity';

export class CreateFacultyDto { 
    @IsNotEmpty()
    @IsNumber()
    staffId: number;     
    
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
    role: UserRole = UserRole.FACULTY;    
}
