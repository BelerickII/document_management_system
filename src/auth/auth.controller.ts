import { Body, Controller, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { logInDto } from './Dto/login.dto';
import { ResetPwdDto } from './Dto/resetPwd.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UsePipes(ValidationPipe)
    async login(@Body() dto: logInDto) {
        //calling 2 methods in one endpoint xD
        const user = await this.authService.validateUser(
            dto.username, dto.password
        );
        return await this.authService.login(user);
    }

    @Post('reset-password')
    @UsePipes(ValidationPipe)
    async resetPwd(@Req() req, @Body() dto: ResetPwdDto) {
        const id: number = req.user.sub;
        return this.authService.resetPwd(id, dto.newPassword)
    }
}
