import { IsNotEmpty, IsEmail, IsEnum } from "class-validator";
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
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
    role: UserRole = UserRole.ADMIN;
}