import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './Configuration/typeORM.config';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot(typeOrmConfig),
  ],  
})
export class AppModule {}
