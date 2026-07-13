import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ChannelMemberRepository,
  CreateChannelMemberData,
} from '../../../domain/repositories/channel-member.repository';
import { ChannelMemberEntity } from '../../../domain/entities/channel-member.entity';
import { ChannelMemberMapper } from '../mappers/channel-member.mapper';

@Injectable()
export class ChannelMemberPrismaRepository implements ChannelMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateChannelMemberData): Promise<ChannelMemberEntity> {
    const created = await this.prisma.channelMember.create({
      data: ChannelMemberMapper.toCreatePrisma(data),
    });
    return ChannelMemberMapper.toDomain(created);
  }

  async findByChannelAndUser(
    channelId: string,
    userId: string,
  ): Promise<ChannelMemberEntity | null> {
    const member = await this.prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    });
    if (!member) return null;
    return ChannelMemberMapper.toDomain(member);
  }

  async findByChannel(channelId: string): Promise<ChannelMemberEntity[]> {
    const members = await this.prisma.channelMember.findMany({
      where: { channelId },
    });
    return members.map(ChannelMemberMapper.toDomain);
  }

  async findByUser(userId: string): Promise<ChannelMemberEntity[]> {
    const members = await this.prisma.channelMember.findMany({
      where: { userId },
    });
    return members.map(ChannelMemberMapper.toDomain);
  }

  async updateLastRead(channelId: string, userId: string): Promise<void> {
    await this.prisma.channelMember.update({
      where: { channelId_userId: { channelId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  async getUnreadCount(channelId: string, userId: string): Promise<number> {
    const membership = await this.prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    });

    const baseWhere: any = {
      channelId,
      senderId: { not: userId },
      // System events (e.g. "user joined the channel") must not count as unread
      isSystem: false,
    };

    if (membership?.lastReadAt) {
      baseWhere.createdAt = { gt: membership.lastReadAt };
    }

    return this.prisma.message.count({
      where: baseWhere,
    });
  }

  async delete(channelId: string, userId: string): Promise<void> {
    await this.prisma.channelMember.delete({
      where: { channelId_userId: { channelId, userId } },
    });
  }
}
