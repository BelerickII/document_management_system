import { IsNotEmpty, IsEnum, IsEmail, IsString, IsNumberString } from 'class-validator';
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
    @IsEnum(UserRole)
    role: UserRole = UserRole.FACULTY;    
}
