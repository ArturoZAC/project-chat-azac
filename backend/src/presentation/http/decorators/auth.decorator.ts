import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../../../domain/entities/user.entity';

export function Auth(...roles: Role[]) {
  if (roles.length === 0) {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}
