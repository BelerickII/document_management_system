import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

import { reviewDto } from './Dto/review.dto';
import { CreateStudentDto } from './Dto/create-student.dto';
import { CreateFacultyDto } from './Dto/create-faculty-staff.dto';
import { CreateUserDto } from './Dto/create-user.dto';
import { User } from './Entities/user.entity';
import { AuthGuard } from '@nestjs/passport';


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

    //Handler hit when the staff clicks on the view button of an uploaded document, allows a staff to lock a document and remove it from the pool with websocket
    @Patch(':id/lock')
    @UseGuards(AuthGuard('jwt'))
    async lockDocument (@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const documentId = id;        
        const staffId: number = req.user.id;
        // console.log(staffId);
        if (!staffId) throw new BadRequestException('Unauthenicated');
        
        return this.userService.lockDocument(documentId, staffId);
    }

    //Handler hit when the staff Accept/Reject the viewed document
    @Patch(':id/review')
    @UseGuards(AuthGuard('jwt'))
    async reviewDoc (@Param('id', ParseIntPipe) id: number, @Body() body: reviewDto, @Req() req: any) {
        const documentId = id;
        const staffId: number = req.user.id;
        // console.log(staffId);
        if (!staffId) throw new BadRequestException('Unauthenicated');

        const action = body.action;
        if (action === undefined) throw new BadRequestException('Action required')

        if (action === 'Rejected' && !body.comment) {
            throw new BadRequestException('Reason for rejection is required');
        }

        return this.userService.reviewDocument(documentId, staffId, action, body.comment);
    }

    //Handler that return the document to the available pool if the staff doesn't perform an action within a timeframe
    @Patch(':id/lock-expired')
    unlockExpired(@Param('id', ParseIntPipe) id: number) {
        return this.userService.unlockExpired(id);
    }

    //Handler that allows a staff to view an uploaded document
    @Get(':id/view')
    @UseGuards(AuthGuard('jwt'))
    async viewDocument (@Param('id', ParseIntPipe) id: number, @Res() res, @Req() req: any) {
        const documentId = id;        
        const staffId = req.user.id;             
        if (!staffId) throw new BadRequestException('Unauthenicated');

        const filePath = await this.userService.viewDoc(documentId, staffId);
        return res.sendFile(filePath);
    }

    //Handler that handles the student dashboard
    @Get('student-dashboard')
    @UseGuards(AuthGuard('jwt'))
    async getStudentDashboard(@Req() req) {
        const studentId = req.user.id;
        return this.userService.studentDashboard(studentId);
    }

    //Handler that handles the staff dashboard
    @Get('staff-dashboard')
    @UseGuards(AuthGuard('jwt'))
    async getStaffDashboard(@Req() req) {
        const staffId = req.user.id;
        return this.userService.staffDashboard(staffId);
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