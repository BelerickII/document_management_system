import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { AppLogger } from "./logger.service";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLogger) {}

    catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    this.logger.error('Unhandled exception', (exception as any)?.stack, {
      route: request.url,
      method: request.method,
      userId: (request as any).user?.id,
    });

    response.status(status).json({
      message: 'An unexpected error occurred',
    });
  }
}