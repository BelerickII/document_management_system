import { IsNotEmpty, IsEnum, IsEmail, IsNumber, IsString, } from 'class-validator';
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
    @IsEnum(UserRole)
    role: UserRole = UserRole.FACULTY;    
}
