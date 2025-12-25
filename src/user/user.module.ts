import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';

//----------------05/10/2025-----------------
import { userRepository } from './Repositories/user.repository';
import { staffRepository } from './Repositories/faculty-staff.repository';
import { studentRepository } from './Repositories/student.repository';

import { User } from './Entities/user.entity';
import { FacultyStaff } from './Entities/faculty-staff.entity';
import { Student } from './Entities/student.entity';
import { DocumentRequirementModule } from 'src/document-requirement/document-requirement.module';
import { SessionModule } from 'src/session/session.module';
import { documentGateway } from './Others/staff.gateway';
import { emailService } from './Others/email.service';
import { SseService } from 'src/sse/sse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FacultyStaff, Student]),
    DocumentRequirementModule,
    forwardRef(() => SessionModule)
  ],
  controllers: [UserController],
  providers: [
    userRepository,
    staffRepository,
    studentRepository,
    UserService,
    documentGateway,
    emailService,
    SseService,
  ],
  exports: [UserService, TypeOrmModule, studentRepository, staffRepository, documentGateway, emailService]
})

export class UserModule {}
