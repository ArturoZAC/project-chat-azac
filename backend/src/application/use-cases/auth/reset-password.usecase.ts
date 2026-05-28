import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordResetRepository } from '../../../domain/repositories/password-reset.repository';
import { ResetPasswordDto } from '../../../presentation/http/auth/dtos/reset-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordResetRepo: PasswordResetRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.passwordResetRepo.findByToken(dto.token);
    if (!record) throw new BadRequestException('Token inválido');
    if (record.isExpired()) throw new BadRequestException('Token expirado');
    if (record.isUsed()) throw new BadRequestException('Token ya usado');

    const user = await this.userRepo.findById(record.userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update(user);

    await this.passwordResetRepo.markAsUsed(record.id);
  }
}
