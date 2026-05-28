import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { LoginDto } from '../../../presentation/http/auth/dtos/login.dto';
import * as bcrypt from 'bcryptjs';

export interface LoginResult {
  token: string;
  userId: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isEmailVerified)
      throw new UnauthorizedException('Debes verificar tu email primero');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { token, userId: user.id };
  }
}
