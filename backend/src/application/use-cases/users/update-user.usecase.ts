import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';

export interface UpdateUserParams {
  id: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: UpdateUserParams): Promise<UserEntity> {
    const user = await this.userRepo.findById(params.id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // ── Update username ──────────────────────────────
    if (params.username) {
      const exists = await this.userRepo.findByUsername(params.username);
      if (exists && exists.id !== params.id) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
      user.username = params.username;
    }

    // ── Update email ──────────────────────────────────
    if (params.email) {
      const exists = await this.userRepo.findByEmail(params.email);
      if (exists && exists.id !== params.id) {
        throw new ConflictException('El email ya está en uso');
      }
      user.email = params.email;
    }

    // ── Update password ───────────────────────────────
    if (params.newPassword) {
      if (!params.currentPassword) {
        throw new BadRequestException(
          'Debes proporcionar tu contraseña actual para cambiarla',
        );
      }

      const isValid = await bcrypt.compare(
        params.currentPassword,
        user.passwordHash,
      );
      if (!isValid) {
        throw new UnauthorizedException('La contraseña actual no es correcta');
      }

      user.passwordHash = await bcrypt.hash(params.newPassword, 10);
    }

    return this.userRepo.update(user);
  }
}
