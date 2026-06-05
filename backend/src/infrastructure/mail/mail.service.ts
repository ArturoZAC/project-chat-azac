import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { envs } from '../../config/envs';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `${envs.CLIENT_URL}/verify-email?token=${token}`;
    // const url = `${envs.APP_URL}/api/auth/verify-email?token=${token}`;
    await this.mailer.sendMail({
      to,
      subject: 'Verifica tu cuenta — Chat AZAC',
      template: 'verify-email',
      context: { username, url },
    });
  }

  async sendResetPasswordEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `${envs.CLIENT_URL}/reset-password?token=${token}`;
    await this.mailer.sendMail({
      to,
      subject: 'Recupera tu contraseña — Chat AZAC',
      template: 'reset-password',
      context: { username, url },
    });
  }
}
