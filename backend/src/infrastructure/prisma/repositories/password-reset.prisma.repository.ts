import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PasswordResetRepository } from '../../../domain/repositories/password-reset.repository';
import { PasswordResetEntity } from '../../../domain/entities/password-reset.entity';
import { PasswordResetMapper } from '../mappers/password-reset.mapper';

@Injectable()
export class PasswordResetPrismaRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: PasswordResetEntity): Promise<PasswordResetEntity> {
    const created = await this.prisma.passwordReset.create({
      data: PasswordResetMapper.toPrisma(entity),
    });
    return PasswordResetMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<PasswordResetEntity | null> {
    const record = await this.prisma.passwordReset.findUnique({
      where: { token },
    });
    if (!record) return null;
    return PasswordResetMapper.toDomain(record);
  }

  async findByUserId(userId: string): Promise<PasswordResetEntity | null> {
    const record = await this.prisma.passwordReset.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return null;
    return PasswordResetMapper.toDomain(record);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.passwordReset.deleteMany({ where: { userId } });
  }
}
