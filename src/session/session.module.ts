import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { academicSession } from './Entities/Academic-Session.entity';
import { documentUploads } from './Entities/Student-Uploads.entity';
import { DocumentRequirementModule } from 'src/document-requirement/document-requirement.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    DocumentRequirementModule,
    UserModule,
    TypeOrmModule.forFeature([academicSession, documentUploads])
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [TypeOrmModule]
})
export class SessionModule {}
