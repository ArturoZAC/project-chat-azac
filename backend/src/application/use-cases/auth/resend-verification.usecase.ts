import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EmailVerificationRepository } from '../../../domain/repositories/email-verification.repository';
import { MailService } from '../../../infrastructure/mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
    private readonly mailService: MailService,
  ) {}

  async execute({ email }: { email: string }): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user)
      throw new NotFoundException('No existe una cuenta con ese email');

    if (user.isEmailVerified)
      throw new BadRequestException('El email ya está verificado');

    // Elimina el token anterior si existe
    await this.emailVerificationRepo.deleteByUserId(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.emailVerificationRepo.create({
      token,
      expiresAt,
      userId: user.id,
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      user.username,
      token,
    );
  }
}
