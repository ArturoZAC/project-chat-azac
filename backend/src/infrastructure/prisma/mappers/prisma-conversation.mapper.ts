import { Conversation as PrismaConversation } from '../../../../generated/prisma';
import { ConversationEntity } from '../../../domain/entities/conversation.entity';
import { ConversationWithDetails } from '../../../domain/repositories/conversation.repository';
import { MessageMapper } from './message.mapper';

export class ConversationMapper {
  static toDomain(prisma: PrismaConversation): ConversationEntity {
    return new ConversationEntity({
      id: prisma.id,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPrisma(entity: ConversationEntity) {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponse(entity: ConversationEntity) {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDetailsResponse(details: ConversationWithDetails) {
    return {
      conversation: this.toResponse(details.conversation),
      participants: details.participants,
      lastMessage: details.lastMessage
        ? MessageMapper.toResponse(details.lastMessage)
        : null,
      unreadCount: details.unreadCount,
    };
  }
}
