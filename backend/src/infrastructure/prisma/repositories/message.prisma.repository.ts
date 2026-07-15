import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  MessageRepository,
  CreateMessageData,
  UpdateMessageData,
  MessagePaginationParams,
  PaginatedMessages,
} from '../../../domain/repositories/message.repository';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class MessagePrismaRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMessageData): Promise<MessageEntity> {
    const created = await this.prisma.message.create({
      data: MessageMapper.toCreatePrisma(data),
    });
    return MessageMapper.toDomain(created);
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) return null;
    return MessageMapper.toDomain(message);
  }

  async findLastByChannel(channelId: string): Promise<MessageEntity | null> {
    const message = await this.prisma.message.findFirst({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
    if (!message) return null;
    return MessageMapper.toDomain(message);
  }

  async findByChannel(
    channelId: string,
    params: MessagePaginationParams,
  ): Promise<PaginatedMessages> {
    const skip = (params.page - 1) * params.limit;

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { channelId },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.message.count({ where: { channelId } }),
    ]);

    return {
      data: messages.map(MessageMapper.toDomain),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async update(id: string, data: UpdateMessageData): Promise<MessageEntity> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: { content: data.content, isEdited: true, editedAt: new Date() },
    });
    return MessageMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.message.delete({ where: { id } });
  }

  async countByUserInRange(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<Array<{ date: string; count: number }>> {
    const rows: Array<{ date: string; count: bigint }> = await this.prisma
      .$queryRaw`
      SELECT DATE(created_at)::text AS date, COUNT(*)::int AS count
      FROM messages
      WHERE sender_id = ${userId}
        AND created_at >= ${from}
        AND created_at <= ${to}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    return rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }

  async countByChannelGroupedByUser(
    channelId: string,
  ): Promise<Array<{ userId: string; username: string; count: number }>> {
    const grouped = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { channelId },
      _count: { id: true },
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map((g) => g.senderId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    return grouped
      .map((g) => ({
        userId: g.senderId,
        username: userMap.get(g.senderId) ?? 'Desconocido',
        count: g._count.id,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
