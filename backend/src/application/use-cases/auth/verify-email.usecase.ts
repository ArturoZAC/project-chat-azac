import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EmailVerificationRepository } from '../../../domain/repositories/email-verification.repository';
import { VerifyEmailDto } from './verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
  ) {}

  async execute(dto: VerifyEmailDto): Promise<void> {
    const record = await this.emailVerificationRepo.findByToken(dto.token);
    if (!record) throw new BadRequestException('Token inválido');
    if (record.isExpired()) throw new BadRequestException('Token expirado');

    const user = await this.userRepo.findById(record.userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    user.isEmailVerified = true;
    await this.userRepo.update(user);

    await this.emailVerificationRepo.delete(record.id);
  }
}
