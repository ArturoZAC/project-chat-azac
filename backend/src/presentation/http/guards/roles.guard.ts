import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../domain/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Solo usuarios con rol ${requiredRoles.join(' o ')} pueden acceder a este recurso`,
      );
    }

    return requiredRoles.includes(user.role);
  }
}
