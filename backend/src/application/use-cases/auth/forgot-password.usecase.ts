import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordResetRepository } from '../../../domain/repositories/password-reset.repository';
import { MailService } from '../../../infrastructure/mail/mail.service';
import { ForgotPasswordDto } from '../../../presentation/http/auth/dtos/forgot-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordResetRepo: PasswordResetRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) return; // no revelamos si existe o no

    await this.passwordResetRepo.deleteByUserId(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetRepo.create({
      token,
      expiresAt,
      userId: user.id,
    });

    // await this.mailService.sendPasswordResetEmail(user.email, token);
    await this.mailService.sendResetPasswordEmail(
      user.email,
      user.username,
      token,
    );
  }
}
