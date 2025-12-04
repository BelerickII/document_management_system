import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateStudentDto } from './Dto/create-student.dto';
import { CreateFacultyDto } from './Dto/create-faculty-staff.dto';
import { CreateUserDto } from './Dto/create-user.dto';
import { User } from './Entities/user.entity';


@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    //--------------- Admin Endpoints ----------------//

    //Handler for the upload CSV of students
    @Post('admin/student-csv')
    @UseInterceptors(FileInterceptor('file'))
    async uploadstudentsCsv(@UploadedFile() file: Express.Multer.File) {
        return this.userService.uploadstudentsCsv(file);        
    }

    //Handler for creating a single student
    @Post('admin/create-student')
    @UsePipes(ValidationPipe)
    async createStudent(@Body() dto: CreateStudentDto) {
        return this.userService.createSingleStudent(dto);
    }

    //Handler for creating a staff
    @Post('admin/create-staff')
    @UsePipes(ValidationPipe)
    async createStaff(@Body() dto: CreateFacultyDto) {
        return this.userService.createStaff(dto);
    }

    //Handler for creating an admin
    @Post('admin/create-admin')
    @UsePipes(ValidationPipe)
    async createAdmin (@Body() dto: CreateUserDto) {
        return this.userService.createAdmin(dto)
    }

    @Patch('staff/doc-status')
    async patchDocStatus () {

    }

    //Handler for getting user by email, matric no & staff id
    @Get('search')
    async searchUsers(@Query('query') searchTerm: string): Promise<User[]> {
        return this.userService.searchUsers(searchTerm)
    }

    //Handler for getting student uploaded documents
    @Get('uploads')
    async getAllUploadedDocs(@Query('page') page = '1', @Query('limit') limit ='50') {
        return this.userService.getAllUploadedDocs(+page, +limit)
    }

    //Handler for getting all users & filtering by role
    @Get()
    async getAllUsers(@Query('page') page = '1', @Query('limit') limit ='50', @Query('role') role?: string) {
        return this.userService.getAllUsers(+page, +limit, role);
    }

    //Handler for getting a user details by ID
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.getUserById(id)
    }

}