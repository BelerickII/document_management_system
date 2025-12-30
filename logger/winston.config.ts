import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const rotateFile = (filename: string, level: string) =>
  new winston.transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level,
    maxSize: '20m',
    maxFiles: '14d',
  });

export const winstonConfig = {
  format: logFormat,
  transports: [
    rotateFile('app', 'info'),
    rotateFile('error', 'error'),
  ],
};