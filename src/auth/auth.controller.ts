import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { logInDto } from './Dto/login.dto';
import { ResetPwdDto } from './Dto/resetPwd.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(AuthGuard('local'))
    @UsePipes(ValidationPipe)
    async login(@Body() dto: logInDto) {
        //calling 2 methods in one endpoint xD
        const user = await this.authService.validateUser(
            dto.username, dto.password
        );
        return await this.authService.login(user);
    }

    @Post('reset-password')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(ValidationPipe)
    async resetPwd(@Req() req, @Body() dto: ResetPwdDto) {        
        const id: number = req.user.sub;
        return this.authService.resetPwd(id, dto.newPassword)
    }
}
