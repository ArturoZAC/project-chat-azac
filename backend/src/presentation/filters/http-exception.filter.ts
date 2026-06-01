import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { winstonLogger } from '../../infrastructure/logger/winston.logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? ((exception.getResponse() as any)?.message ?? exception.message)
        : 'Internal server error';

    winstonLogger.error(
      `${request.method} ${request.url} ${status} — ${message}`,
      {
        context: 'HttpExceptionFilter',
        stack: exception instanceof Error ? exception.stack : undefined,
      },
    );

    response.status(status).json({
      success: false,
      data: null,
      message,
    });
  }
}
