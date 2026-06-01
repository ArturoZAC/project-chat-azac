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

  async delete(channelId: string, userId: string): Promise<void> {
    await this.prisma.channelMember.delete({
      where: { channelId_userId: { channelId, userId } },
    });
  }
}
