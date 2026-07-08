import { ChannelInvitation as PrismaChannelInvitation } from '../../../../generated/prisma';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import { CreateChannelInvitationData } from '../../../domain/repositories/channel-invitation.repository';

export class ChannelInvitationMapper {
  static toDomain(prisma: PrismaChannelInvitation): ChannelInvitationEntity {
    return new ChannelInvitationEntity({
      id: prisma.id,
      token: prisma.token,
      channelId: prisma.channelId,
      createdById: prisma.createdById,
      expiresAt: prisma.expiresAt,
      usedAt: prisma.usedAt,
      createdAt: prisma.createdAt,
    });
  }

  static toCreatePrisma(data: CreateChannelInvitationData) {
    return {
      token: data.token,
      channelId: data.channelId,
      createdById: data.createdById,
      expiresAt: data.expiresAt,
    };
  }
}
