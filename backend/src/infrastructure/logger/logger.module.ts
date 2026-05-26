import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './winston.logger';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      instance: winstonLogger,
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
