import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateEmailVerificationData,
  EmailVerificationRepository,
} from '../../../domain/repositories/email-verification.repository';
// import { CreateEmailVerificationData } from '../../../domain/repositories/email-verification.repository';

import { EmailVerificationEntity } from '../../../domain/entities/email-verification.entity';
import { EmailVerificationMapper } from '../mappers/email-verification.mapper';

@Injectable()
export class EmailVerificationPrismaRepository implements EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // async create(
  //   entity: EmailVerificationEntity,
  // ): Promise<EmailVerificationEntity> {
  //   const created = await this.prisma.emailVerification.create({
  //     data: EmailVerificationMapper.toPrisma(entity),
  //   });
  //   return EmailVerificationMapper.toDomain(created);
  // }

  async create(
    data: CreateEmailVerificationData,
  ): Promise<EmailVerificationEntity> {
    const created = await this.prisma.emailVerification.create({
      data: EmailVerificationMapper.toCreatePrisma(data),
    });
    return EmailVerificationMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<EmailVerificationEntity | null> {
    const record = await this.prisma.emailVerification.findUnique({
      where: { token },
    });
    if (!record) return null;
    return EmailVerificationMapper.toDomain(record);
  }

  async findByUserId(userId: string): Promise<EmailVerificationEntity | null> {
    const record = await this.prisma.emailVerification.findFirst({
      where: { userId },
    });
    if (!record) return null;
    return EmailVerificationMapper.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.emailVerification.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.emailVerification.deleteMany({ where: { userId } });
  }
}
