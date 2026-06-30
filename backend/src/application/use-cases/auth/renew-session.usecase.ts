import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { envs } from '../../../config/envs';
import type { JwtPayload } from '../../../infrastructure/auth/jwt.strategy';

export interface RenewSessionResult {
  token: string;
  userId: string;
  user: UserEntity;
  rememberMe: boolean;
}

@Injectable()
export class RenewSessionUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(token: string): Promise<RenewSessionResult> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userRepo.findById(payload.id);
    if (!user)
      throw new UnauthorizedException('Usuario no encontrado');

    const rememberMe = payload.rememberMe ?? false;

    const newToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        rememberMe,
      },
      { expiresIn: rememberMe ? '7d' : envs.JWT_EXPIRES_IN } as any,
    );

    return { token: newToken, userId: user.id, user, rememberMe };
  }
}
