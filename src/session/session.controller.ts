import { BadGatewayException, Body, Controller, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { SessionService } from './session.service';
import { academicSessionDto, uploadDocDto } from './Dto/create-session.dto';

import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/gaurds/roles.decorator';
import { UserRole } from 'src/user/Entities/user.entity';
import { JwtAuthGaurd } from 'src/auth/gaurds/jwt-auth.guard';
import { RolesGuard } from 'src/auth/gaurds/roles.gaurd';

@Controller('session')
export class SessionController {
    constructor (private readonly sessionService: SessionService) {}

    //Handler for creating new sessions
    @Post('create-session')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async createSession(@Body() dto: academicSessionDto) {
        return this.sessionService.newSession(dto);
    }

    //Handler to end a session
    @Post('end-session')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async endSession() {
        return this.sessionService.purgeSession()
    }

    //Handler that handles student uploads
    @Post('student/uploads')
    @Roles(UserRole.STUDENT)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = extname(file.originalname);
                    const baseName = file.originalname.replace(ext, '');
                    callback(null, `${baseName}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 8 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
                const ext = extname(file.originalname).toLowerCase();
                if(!allowed.includes(ext)) {
                    return callback(new BadGatewayException('Invalid file type'), false);
                }
                callback(null, true);
            },
        }),
    )
    async uploadDoc(@UploadedFile() file: Express.Multer.File, @Body() dto: uploadDocDto) {
        return this.sessionService.docUpload(file, dto);
    }

    //Handler that permits students to overwrite pending/rejected documents
    @Patch(':documentId/overwrite')
    @Roles(UserRole.STUDENT)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = extname(file.originalname);
                    const baseName = file.originalname.replace(ext, '');
                    callback(null, `${baseName}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 8 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
                const ext = extname(file.originalname).toLowerCase();
                if(!allowed.includes(ext)) {
                    return callback(new BadGatewayException('Invalid file type'), false);
                }
                callback(null, true);
            },
        }),
    )
    async stuReupload(
        @Param('documentId') documentId: number, 
        @Req() req: any, 
        @UploadedFile() file: Express.Multer.File
    ) {
        const studentId = req.user?.id;
        return this.sessionService.stuReupload(file, documentId, studentId)
    }

    //Triggered when "read" button is clicked
    @Patch(':id/read')
    @Roles(UserRole.STUDENT, UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async markOneAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const studentId = req.user.id;
        await this.sessionService.markAsRead(id, studentId);
        return { message: 'Notification cleared' };
    }

    //Triggered when "mark all as read" is clicked
    @Patch('mark-all')
    @Roles(UserRole.STUDENT, UserRole.STAFF)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    async markAllAsRead(@Req() req: any) {
        const studentId = req.user.id;
        await this.sessionService.markAllAsRead(studentId);
        return { message: 'Notifications cleared' };
    }
}
