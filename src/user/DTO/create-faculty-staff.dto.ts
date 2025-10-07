import { IsNotEmpty, IsEnum, IsEmail, IsString, IsBoolean, IsNumberString, } from 'class-validator';
import { UserRole } from '../Entities/user.entity';

export class CreateFacultyDto { 
    @IsNotEmpty()
    @IsNumberString()
    staffId: string;     
    
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
