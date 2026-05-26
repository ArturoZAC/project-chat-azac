import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { LoggerModule } from './infrastructure/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
})
export class AppModule {}
