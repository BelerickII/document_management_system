import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from './Dto/create-student.dto';


@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    //--------------- Admin Endpoints ----------------

    //Upload CSV of students
    @Post('admin/student-csv')
    @UseInterceptors(FileInterceptor('file'))
    async uploadstudentsCsv(@UploadedFile() file: Express.Multer.File) {
        return this.userService.uploadstudentsCsv(file);        
    }

    //Creating a single student
    @Post('admin/create-student')
    async createStudent(@Body() dto: CreateStudentDto) {
        return this.userService.createSingleStudent(dto);
    }
}