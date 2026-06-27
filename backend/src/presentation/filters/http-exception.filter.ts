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

    // ─── Construir mensaje para el frontend ────────────────
    let clientMessage: string | string[] = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      const raw = (exception.getResponse() as any)?.message;

      // ValidationPipe devuelve array de strings: ["email inválido", "password muy corta"]
      // esos sí son seguros y útiles para el frontend
      if (Array.isArray(raw) && raw.every((r: unknown) => typeof r === 'string')) {
        clientMessage = raw;
      } else if (status >= 500) {
        // Errores 500+ nunca exponen detalle al cliente
        clientMessage = 'Error interno del servidor';
      } else {
        // 400, 401, 403, 404 — mensajes seguros (no contienen stacks ni secrets)
        clientMessage = typeof raw === 'string' ? raw : exception.message;
      }
    }

    // ─── Log completo (con stack) solo para el servidor ────
    winstonLogger.error(
      `${request.method} ${request.url} ${status}`,
      {
        context: 'HttpExceptionFilter',
        stack: exception instanceof Error ? exception.stack : undefined,
        rawMessage: exception instanceof HttpException
          ? exception.message
          : 'Non-HTTP exception',
      },
    );

    // ─── Respuesta limpia al frontend ──────────────────────
    response.status(status).json({
      success: false,
      data: null,
      message: clientMessage,
    });
  }
}
