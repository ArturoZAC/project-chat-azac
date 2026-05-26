import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3100').transform(Number),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_URL: z.string().min(1, 'APP_URL es requerida'),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL es requerida'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET es requerida'),
  JWT_EXPIRES_IN: z.string().default('1d'),

  MAIL_HOST: z.string().min(1, 'MAIL_HOST es requerido'),
  MAIL_PORT: z.string().default('587').transform(Number),
  MAIL_USER: z.string().min(1, 'MAIL_USER es requerido'),
  MAIL_PASS: z.string().min(1, 'MAIL_PASS es requerido'),
  MAIL_FROM: z.string().min(1, 'MAIL_FROM es requerido'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const envs = parsed.data;
