import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FacultyStaff, Student]),
    DocumentRequirementModule,

  ],
  controllers: [UserController],
  providers: [userRepository, staffRepository, studentRepository, UserService],
  exports: [TypeOrmModule, ]
})

export class UserModule {}
