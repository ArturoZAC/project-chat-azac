import { EmailVerification as PrismaEmailVerification } from '../../../../generated/prisma';
import { EmailVerificationEntity } from '../../../domain/entities/email-verification.entity';
import { CreateEmailVerificationData } from '../../../domain/repositories/email-verification.repository';

export class EmailVerificationMapper {
  static toDomain(prisma: PrismaEmailVerification): EmailVerificationEntity {
    return new EmailVerificationEntity({
      id: prisma.id,
      token: prisma.token,
      expiresAt: prisma.expiresAt,
      createdAt: prisma.createdAt,
      userId: prisma.userId,
    });
  }

  static toPrisma(entity: EmailVerificationEntity): PrismaEmailVerification {
    return {
      id: entity.id,
      token: entity.token,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      userId: entity.userId,
    };
  }

  static toCreatePrisma(data: CreateEmailVerificationData) {
    return {
      token: data.token,
      expiresAt: data.expiresAt,
      userId: data.userId,
    };
  }
}
