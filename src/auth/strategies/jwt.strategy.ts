import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor (
        private readonly userService: UserService,
        readonly config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET') as string,
            ignoreExpiration: false,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findById(payload.sub);
        if (!user) throw new UnauthorizedException('User not found');

        //Invalidate token issued before password reset
        if (
            user.lastPasswordReset && payload.iat * 1000 < user.lastPasswordReset.getTime()
        ){
            throw new UnauthorizedException('Token expired after password change - please log in again');
        }

        return user;
    }

}