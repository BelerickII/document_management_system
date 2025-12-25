import { forwardRef, Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { academicSession } from './Entities/Academic-Session.entity';
import { documentUploads } from './Entities/Student-Uploads.entity';
import { registeredStudent } from './Entities/Registration.entity';
import { SseService } from 'src/sse/sse.service';
import { Notification } from './Entities/Notification.entity';
import { staffRepository } from 'src/user/Repositories/faculty-staff.repository';
import { UserModule } from 'src/user/user.module';
import { DocsRequirement } from 'src/document-requirement/Entities/docsRequiement.entity';

@Module({
  imports: [    
    TypeOrmModule.forFeature([academicSession, documentUploads, registeredStudent, Notification, DocsRequirement]),
    forwardRef(() => UserModule)    
  ],
  controllers: [SessionController],
  providers: [SessionService, SseService, staffRepository],
  exports: [TypeOrmModule]
})
export class SessionModule {}
