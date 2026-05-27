import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { envs } from '../../config/envs';
import { MailService } from './mail.service';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';
// const {
//   HandlebarsAdapter,
// } = require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');

import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: envs.MAIL_HOST,
        port: envs.MAIL_PORT,
        secure: envs.MAIL_PORT === 465,
        auth: {
          user: envs.MAIL_USER,
          pass: envs.MAIL_PASS,
        },
      },
      defaults: {
        from: `"Chat AZAC" <${envs.MAIL_FROM}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
