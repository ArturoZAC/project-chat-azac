import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const statusCode = response.statusCode;

          if (statusCode >= 400 && statusCode < 500) {
            this.logger.warn(`${method} ${url} ${statusCode} - ${ms}ms`, {
              context: 'LoggingInterceptor',
            });
          } else {
            this.logger.info(`${method} ${url} ${statusCode} - ${ms}ms`, {
              context: 'LoggingInterceptor',
            });
          }
        },
        error: (error) => {
          const ms = Date.now() - start;
          this.logger.error(`${method} ${url} - ${ms}ms — ${error.message}`, {
            context: 'LoggingInterceptor',
            stack: error.stack,
          });
        },
      }),
    );
  }
}
