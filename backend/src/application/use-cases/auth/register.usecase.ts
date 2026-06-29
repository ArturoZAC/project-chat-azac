import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EmailVerificationRepository } from '../../../domain/repositories/email-verification.repository';
import { MailService } from '../../../infrastructure/mail/mail.service';
import { RegisterDto } from '../../../presentation/http/auth/dtos/register.dto';
import { UserEntity } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: RegisterDto): Promise<UserEntity> {
    const emailExists = await this.userRepo.findByEmail(dto.email);
    if (emailExists) throw new ConflictException('El email ya está en uso');

    const usernameExists = await this.userRepo.findByUsername(dto.username);
    if (usernameExists)
      throw new ConflictException('El username ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({ ...dto, passwordHash });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.emailVerificationRepo.create({
      token,
      expiresAt,
      userId: user.id,
    });

    // Fire & Forget: email en background, User A no espera
    this.mailService.sendVerificationEmail(
      user.email,
      user.username,
      token,
    ).catch(err => Logger.error('Error enviando email de verificación:', err));

    return user;
  }
}
