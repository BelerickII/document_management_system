import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateStudentDto } from './Dto/create-student.dto';
import { CreateFacultyDto } from './Dto/create-faculty-staff.dto';
import { CreateUserDto } from './Dto/create-user.dto';


@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    //--------------- Admin Endpoints ----------------

    //Handler for the upload CSV of students
    @Post('admin/student-csv')
    @UseInterceptors(FileInterceptor('file'))
    async uploadstudentsCsv(@UploadedFile() file: Express.Multer.File) {
        return this.userService.uploadstudentsCsv(file);        
    }

    //Handler for creating a single student
    @Post('admin/create-student')
    async createStudent(@Body() dto: CreateStudentDto) {
        return this.userService.createSingleStudent(dto);
    }

    //Handler for creating a staff
    @Post('admin/create-staff')
    async createStaff(@Body() dto: CreateFacultyDto) {
        return this.userService.createStaff(dto);
    }

    @Post('admin/create-admin')
    async createAdmin (@Body() dto: CreateUserDto) {
        return this.userService.createAdmin(dto)
    }
}