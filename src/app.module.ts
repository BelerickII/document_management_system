import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { DocumentRequirementModule } from './document-requirement/document-requirement.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { SseModule } from './sse/sse.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './Configuration/typeORM.config';
import { AppLogger } from 'logger/logger.service';


@Module({
  imports: [
    UserModule,
    DocumentRequirementModule,
    SessionModule,
    AuthModule,
    SseModule,
    ConfigModule.forRoot({ isGlobal: true, validationSchema}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger]
})
export class AppModule {}
