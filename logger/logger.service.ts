import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from 'winston';
import { winstonConfig } from './winston.config';

@Injectable()
export class AppLogger implements LoggerService {
    private readonly logger = winston.createLogger(winstonConfig);
    
    log(message: string, meta?: any) {
        this.logger.info(message, meta);
    }

    warn(message: string, meta?: any) {
        this.logger.warn(message, meta);
    }

    error(message: string, trace?: string, meta?: any) {
        this.logger.error(message, { trace, ...meta });
    }
}