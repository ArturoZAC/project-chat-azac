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
}
