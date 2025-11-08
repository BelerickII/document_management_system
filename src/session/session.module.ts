import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { academicSession } from './Entities/Academic-Session.entity';
import { documentUploads } from './Entities/Student-Uploads.entity';
import { registeredStudent } from './Entities/Registration.entity';

@Module({
  imports: [    
    TypeOrmModule.forFeature([academicSession, documentUploads, registeredStudent])
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [TypeOrmModule]
})
export class SessionModule {}
