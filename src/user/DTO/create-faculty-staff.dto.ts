import { IsNotEmpty, IsEnum, IsEmail, IsString, IsNumberString } from 'class-validator';
import { UserRole } from '../Entities/user.entity';
import { Notification } from 'src/session/Entities/Notification.entity';

export class CreateFacultyDto { 
    @IsNotEmpty() 
    @IsNumberString()  
    staffID: string;     
    
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
    role: UserRole = UserRole.STAFF;    
}

export class staffDashboardDto {
    @IsNotEmpty()
    staffName: string;

    @IsNotEmpty()
    academicSession: string;

    @IsNotEmpty()
    totalDocumentsUploaded: number;

    @IsNotEmpty()
    totalStudentRegistered: number;

    @IsNotEmpty()
    totalActiveStudent: number;

    @IsNotEmpty()
    pendingDocument: number;

    @IsNotEmpty()
    documentsReviewed: number;

    @IsNotEmpty()
    getNotifications: { data: Notification[]; count: number };
}