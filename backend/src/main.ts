import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
  WinstonModule,
} from 'nest-winston';
import cookieParser from 'cookie-parser';
import { envs } from './config/envs';
import { winstonLogger } from './infrastructure/logger/winston.logger';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { LoggingInterceptor } from './presentation/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  // ─── Cookie Parser ────────────────────────────────────────
  app.use(cookieParser());

  // ─── Prefix global ───────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── CORS ────────────────────────────────────────────────
  app.enableCors({
    origin: envs.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  // app.useGlobalInterceptors(new ResponseInterceptor());
  const logger = app.get(WINSTON_MODULE_PROVIDER);
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new ResponseInterceptor(),
  );

  // ─── Pipes globales ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.PORT);
  winstonLogger.info(`🚀 Server running on port ${envs.PORT}`, {
    context: 'Bootstrap',
  });
}

bootstrap();
