import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ChannelPaginationParams,
  ChannelRepository,
  CreateChannelData,
  PaginatedChannels,
  UpdateChannelData,
} from '../../../domain/repositories/channel.repository';
import { ChannelEntity } from '../../../domain/entities/channel.entity';
import { ChannelMapper } from '../mappers/channel.mapper';

@Injectable()
export class ChannelPrismaRepository implements ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string): Promise<ChannelEntity | null> {
    const channel = await this.prisma.channel.findUnique({ where: { name } });
    if (!channel) return null;
    return ChannelMapper.toDomain(channel);
  }

  async create(data: CreateChannelData): Promise<ChannelEntity> {
    const created = await this.prisma.channel.create({
      data: ChannelMapper.toCreatePrisma(data),
    });
    return ChannelMapper.toDomain(created);
  }

  async findById(id: string): Promise<ChannelEntity | null> {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) return null;
    return ChannelMapper.toDomain(channel);
  }

  async findAll(params: ChannelPaginationParams): Promise<PaginatedChannels> {
    const skip = (params.page - 1) * params.limit;

    const [channels, total] = await this.prisma.$transaction([
      this.prisma.channel.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { members: true } },
          createdBy: { select: { id: true, username: true } },
        },
      }),
      this.prisma.channel.count(),
    ]);

    return {
      data: channels.map(ChannelMapper.toDomain),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }
  async update(id: string, data: UpdateChannelData): Promise<ChannelEntity> {
    const updated = await this.prisma.channel.update({
      where: { id },
      data,
    });
    return ChannelMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.channel.delete({ where: { id } });
  }
}
