import { createLogger, format, transports } from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const { combine, timestamp, errors, json } = format;

export const winstonLogger = createLogger({
  transports: [
    // ─── Consola ────────────────────────────────────────────
    new transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        nestWinstonModuleUtilities.format.nestLike('ChatApp', {
          prettyPrint: true,
          colors: true,
        }),
      ),
    }),

    // ─── Todos los logs ─────────────────────────────────────
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),

    // ─── Solo errores ────────────────────────────────────────
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),

    // ─── Solo warnings ───────────────────────────────────────
    new transports.File({
      filename: 'logs/warn.log',
      level: 'warn',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  ],
});
