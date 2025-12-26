import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

import { reviewDto } from './Dto/review.dto';
import { CreateStudentDto } from './Dto/create-student.dto';
import { CreateFacultyDto } from './Dto/create-faculty-staff.dto';
import { CreateUserDto } from './Dto/create-user.dto';
import { User, UserRole } from './Entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/gaurds/roles.decorator';
import { JwtAuthGaurd } from 'src/auth/gaurds/jwt-auth.guard';
import { RolesGuard } from 'src/auth/gaurds/roles.gaurd';


@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    //--------------- Admin Endpoints ----------------//

    //Handler for the upload CSV of students
    @Post('admin/student-csv')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadstudentsCsv(@UploadedFile() file: Express.Multer.File) {
        return this.userService.uploadstudentsCsv(file);        
    }

    //Handler for creating a single student
    @Post('admin/create-student')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async createStudent(@Body() dto: CreateStudentDto) {
        return this.userService.createSingleStudent(dto);
    }

    //Handler for creating a staff
    @Post('admin/create-staff')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async createStaff(@Body() dto: CreateFacultyDto) {
        return this.userService.createStaff(dto);
    }

    //Handler for creating an admin
    @Post('admin/create-admin')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async createAdmin (@Body() dto: CreateUserDto) {
        return this.userService.createAdmin(dto)
    }

    //Handler hit when the staff clicks on the view button of an uploaded document, allows a staff to lock a document and remove it from the pool with websocket
    @Patch(':id/lock')
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async lockDocument (@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const documentId = id;        
        const staffId: number = req.user.id;
        // console.log(staffId);
        if (!staffId) throw new BadRequestException('Unauthenicated');
        
        return this.userService.lockDocument(documentId, staffId);
    }

    //Handler hit when the staff Accept/Reject the viewed document
    @Patch(':id/review')
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
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
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    unlockExpired(@Param('id', ParseIntPipe) id: number) {
        return this.userService.unlockExpired(id);
    }

    //Handler that allows a staff to view an uploaded document
    @Get(':id/view')
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async viewDocument (@Param('id', ParseIntPipe) id: number, @Res() res, @Req() req: any) {
        const documentId = id;        
        const staffId = req.user.id;             
        if (!staffId) throw new BadRequestException('Unauthenicated');

        const filePath = await this.userService.viewDoc(documentId, staffId);
        return res.sendFile(filePath);
    }

    //Handler that handles the student dashboard
    @Get('student-dashboard')
    @Roles(UserRole.STUDENT)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async getStudentDashboard(@Req() req) {
        const studentId = req.user.id;
        return this.userService.studentDashboard(studentId);
    }

    //Handler that handles the staff dashboard
    @Get('staff-dashboard')
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async getStaffDashboard(@Req() req) {
        const staffId = req.user.id;
        return this.userService.staffDashboard(staffId);
    }

    //Handler for getting user by email, matric no & staff id
    @Get('search')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async searchUsers(@Query('query') searchTerm: string): Promise<User[]> {
        return this.userService.searchUsers(searchTerm)
    }

    //Handler for getting student uploaded documents
    @Get('uploads')
    @Roles(UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async getAllUploadedDocs(@Query('page') page = '1', @Query('limit') limit ='50') {
        return this.userService.getAllUploadedDocs(+page, +limit)
    }

    //Handler for getting all users & filtering by role
    @Get()
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async getAllUsers(@Query('page') page = '1', @Query('limit') limit ='50', @Query('role') role?: string) {
        return this.userService.getAllUsers(+page, +limit, role);
    }

    //Handler for getting a user details by ID
    @Get(':id')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.getUserById(id)
    }
}