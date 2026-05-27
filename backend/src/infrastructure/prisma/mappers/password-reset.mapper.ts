import { PasswordReset as PrismaPasswordReset } from '../../../../generated/prisma';
import { PasswordResetEntity } from '../../../domain/entities/password-reset.entity';

export class PasswordResetMapper {
  static toDomain(prisma: PrismaPasswordReset): PasswordResetEntity {
    return new PasswordResetEntity({
      id: prisma.id,
      token: prisma.token,
      expiresAt: prisma.expiresAt,
      usedAt: prisma.usedAt,
      createdAt: prisma.createdAt,
      userId: prisma.userId,
    });
  }

  static toPrisma(entity: PasswordResetEntity): PrismaPasswordReset {
    return {
      id: entity.id,
      token: entity.token,
      expiresAt: entity.expiresAt,
      usedAt: entity.usedAt,
      createdAt: entity.createdAt,
      userId: entity.userId,
    };
  }
}
