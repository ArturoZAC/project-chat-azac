import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import cookieParser from 'cookie-parser';
import { envs } from './config/envs';
import { winstonLogger } from './infrastructure/logger/winston.logger';

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

  // ─── Pipes globales ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.PORT);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // logger.log(`🚀 Server running on port ${envs.PORT}`, 'Bootstrap');
  winstonLogger.info(`🚀 Server running on port ${envs.PORT}`, {
    context: 'Bootstrap',
  });
}

bootstrap();
