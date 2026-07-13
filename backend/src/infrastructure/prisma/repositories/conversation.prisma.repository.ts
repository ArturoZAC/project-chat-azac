import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ConversationRepository,
  CreateConversationData,
  ConversationWithDetails,
  ConversationMessagePaginationParams,
  PaginatedConversationMessages,
} from '../../../domain/repositories/conversation.repository';
import { ConversationEntity } from '../../../domain/entities/conversation.entity';
import { ConversationMapper } from '../mappers/prisma-conversation.mapper';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class ConversationPrismaRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ConversationEntity | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) return null;
    return ConversationMapper.toDomain(conversation);
  }

  async findByUser(userId: string): Promise<ConversationWithDetails[]> {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const result = await Promise.all(
      memberships.map(async (membership) => {
        const conv = membership.conversation;

        const participants = conv.members.map((m) => ({
          id: m.user.id,
          username: m.user.username,
        }));

        const lastMessage =
          conv.messages.length > 0
            ? MessageMapper.toDomain(conv.messages[0])
            : null;

        const unreadCount = await this.getUnreadCount(conv.id, userId);

        return {
          conversation: ConversationMapper.toDomain(conv),
          participants,
          lastMessage,
          unreadCount,
        };
      }),
    );

    // Sort by most recent activity (lastMessage createdAt desc, then conversation updatedAt desc)
    result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? a.conversation.updatedAt;
      const bTime = b.lastMessage?.createdAt ?? b.conversation.updatedAt;
      return bTime.getTime() - aTime.getTime();
    });

    return result;
  }

  async findByParticipants(
    userIds: string[],
  ): Promise<ConversationEntity | null> {
    const [firstId, secondId] = userIds;

    // Get all conversation IDs for the first user
    const firstMemberships = await this.prisma.conversationMember.findMany({
      where: { userId: firstId },
      select: { conversationId: true },
    });

    if (firstMemberships.length === 0) return null;

    // Find if the second user shares any of those conversations
    const common = await this.prisma.conversationMember.findFirst({
      where: {
        userId: secondId,
        conversationId: {
          in: firstMemberships.map((m) => m.conversationId),
        },
      },
    });

    if (!common) return null;

    return this.findById(common.conversationId);
  }

  async create(data: CreateConversationData): Promise<ConversationEntity> {
    const conversation = await this.prisma.conversation.create({
      data: {
        members: {
          create: data.participantIds.map((userId) => ({
            userId,
            lastReadAt: new Date(),
          })),
        },
      },
    });
    return ConversationMapper.toDomain(conversation);
  }

  async getMessages(
    conversationId: string,
    params: ConversationMessagePaginationParams,
  ): Promise<PaginatedConversationMessages> {
    const skip = (params.page - 1) * params.limit;

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      data: messages.map(MessageMapper.toDomain),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });
    return member !== null;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    const baseWhere: any = {
      conversationId,
      senderId: { not: userId },
      // System events must not count as unread
      isSystem: false,
    };

    if (membership?.lastReadAt) {
      baseWhere.createdAt = { gt: membership.lastReadAt };
    }

    return this.prisma.message.count({
      where: baseWhere,
    });
  }

  async findParticipants(conversationId: string): Promise<string[]> {
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    return members.map((m) => m.userId);
  }
}
