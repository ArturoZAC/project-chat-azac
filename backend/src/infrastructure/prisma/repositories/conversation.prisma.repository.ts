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

    return Promise.all(
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
  }

  async findByParticipants(
    userIds: string[],
  ): Promise<ConversationEntity | null> {
    // Need to find a conversation that has exactly these two participants
    const [firstId, secondId] = userIds;

    const common = await this.prisma.conversationMember.findFirst({
      where: { userId: firstId },
      include: {
        conversation: {
          include: {
            members: {
              where: { userId: secondId },
            },
          },
        },
      },
    });

    if (
      common?.conversation?.members &&
      common.conversation.members.length > 0
    ) {
      return ConversationMapper.toDomain(common.conversation);
    }

    return null;
  }

  async create(data: CreateConversationData): Promise<ConversationEntity> {
    const conversation = await this.prisma.conversation.create({
      data: {
        members: {
          create: data.participantIds.map((userId) => ({
            userId,
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

    if (!membership?.lastReadAt) {
      // If never read, count all messages
      return this.prisma.message.count({
        where: { conversationId },
      });
    }

    return this.prisma.message.count({
      where: {
        conversationId,
        createdAt: { gt: membership.lastReadAt },
      },
    });
  }
}
