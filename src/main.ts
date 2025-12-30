import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from 'logger/global-exception.filter';
import { AppLogger } from 'logger/logger.service';
import { LoggingInterceptor } from 'logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(AppLogger)));
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(AppLogger)));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
