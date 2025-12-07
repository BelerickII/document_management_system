import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/Entities/user.entity';
import { academicSession } from 'src/session/Entities/Academic-Session.entity';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { studentRepository } from 'src/user/Repositories/student.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly userservice: UserService,
        private readonly jwtService: JwtService,
        private readonly studentRepo: studentRepository,
        @InjectRepository(academicSession) private readonly acadSession: Repository<academicSession>,
    ) {}

    //Logic to validate a user login credentials (username & password)
    async validateUser (username: string, password: string) {
        const user = await this.userservice.findByUsername(username);
        // console.log(user);
        if(!user) throw new UnauthorizedException('Invalid Credentials');
        // console.log('Password from request:', password); console.log('Password from DB:', user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) throw new UnauthorizedException('Invalid Credentials');
        
        return user;
    }

    //Logic to force user to reset password on first login otherwise create a JWT Token for the user
    async login(user: User) {
        if(user.mustResetPassword === true){
            const tempToken = this.jwtService.sign({sub: user.id, type: 'reset'}, {expiresIn: '10m'});
            throw new ForbiddenException({
                message: 'Password reset required before continuing',
                tempToken,
            });
        }

        //if user has reset their password before do this 👇🏽
        const payload = { sub: user.id, role: user.role};
        const access_token = await this.jwtService.signAsync(payload);

        //Logic for student
        if( user.role === 'student') {
            const currentSession = await this.currentSession();
            const studentData = await this.studentRepo.studentLogin(user.id, currentSession);            
            return { access_token, studentData};
        } else if (user.role === 'staff' || 'admin') {
            return { access_token };
        }
    }

    //Logic to reset user password on first login and update it on DB
    //The frontend app redirects the user to the endpoint of this business logic
    async resetPwd(id: number, newPassword: string ) {
        const user = await this.userservice.findById(id);
        if (!user) throw new UnauthorizedException('User not found');

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.mustResetPassword = false;
        user.lastPasswordReset = new Date();
        await this.userservice.updateUser(user);
        return { message: 'Password reset successful. You can now log in.' };
    }

    //Logic to help get the current session
    async currentSession(): Promise<string> {
        const atvSession = await this.acadSession.findOne({
            where: {isActive: true},
        });

        if(!atvSession){
            throw new UnauthorizedException('No active academic session found.')
        }

        return atvSession.sessionId;
    }
}
