import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { envs } from '../../config/envs';
import { Request } from 'express';

export interface JwtPayload {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepo: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: envs.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT VALIDATE CALLED:', payload);
    const user = await this.userRepo.findById(payload.id);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }
}
