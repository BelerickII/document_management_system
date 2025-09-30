import { IsNotEmpty, IsEnum, IsEmail, } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateFacultyDto { 
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
    role: UserRole = UserRole.FACULTY;

    @IsNotEmpty()
    staffId: string; 
}
