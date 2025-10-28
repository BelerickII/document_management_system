import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './Configuration/typeORM.config';
import { UserModule } from './user/user.module';
import { DocumentRequirementModule } from './document-requirement/document-requirement.module';
import { SessionModule } from './session/session.module';


@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    DocumentRequirementModule,
    SessionModule,
  ],  
})
export class AppModule {}
