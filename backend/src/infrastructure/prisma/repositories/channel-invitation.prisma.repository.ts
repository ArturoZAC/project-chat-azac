import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ChannelInvitationRepository,
  CreateChannelInvitationData,
} from '../../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import { ChannelInvitationMapper } from '../mappers/channel-invitation.mapper';

@Injectable()
export class ChannelInvitationPrismaRepository
  implements ChannelInvitationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateChannelInvitationData,
  ): Promise<ChannelInvitationEntity> {
    const created = await this.prisma.channelInvitation.create({
      data: ChannelInvitationMapper.toCreatePrisma(data),
    });
    return ChannelInvitationMapper.toDomain(created);
  }

  async findByToken(
    token: string,
  ): Promise<ChannelInvitationEntity | null> {
    const invitation = await this.prisma.channelInvitation.findUnique({
      where: { token },
    });
    if (!invitation) return null;
    return ChannelInvitationMapper.toDomain(invitation);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.channelInvitation.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async findValidByChannel(
    channelId: string,
  ): Promise<ChannelInvitationEntity[]> {
    const invitations = await this.prisma.channelInvitation.findMany({
      where: {
        channelId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return invitations.map(ChannelInvitationMapper.toDomain);
  }
}
