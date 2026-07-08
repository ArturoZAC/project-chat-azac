import { Message as PrismaMessage } from '../../../../generated/prisma';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { CreateMessageData } from '../../../domain/repositories/message.repository';

export class MessageMapper {
  static toDomain(prisma: PrismaMessage): MessageEntity {
    return new MessageEntity({
      id: prisma.id,
      content: prisma.content,
      isSystem: prisma.isSystem,
      isEdited: prisma.isEdited,
      editedAt: prisma.editedAt,
      createdAt: prisma.createdAt,
      channelId: prisma.channelId,
      conversationId: prisma.conversationId,
      senderId: prisma.senderId,
      parentId: prisma.parentId,
    });
  }

  static toPrisma(entity: MessageEntity) {
    return {
      id: entity.id,
      content: entity.content,
      isSystem: entity.isSystem,
      isEdited: entity.isEdited,
      editedAt: entity.editedAt,
      createdAt: entity.createdAt,
      channelId: entity.channelId,
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      parentId: entity.parentId,
    };
  }

  static toCreatePrisma(data: CreateMessageData) {
    return {
      content: data.content,
      isSystem: data.isSystem ?? false,
      channelId: data.channelId ?? null,
      conversationId: data.conversationId ?? null,
      senderId: data.senderId,
      parentId: data.parentId ?? null,
    };
  }

  static toResponse(entity: MessageEntity) {
    return {
      id: entity.id,
      content: entity.content,
      isSystem: entity.isSystem,
      isEdited: entity.isEdited,
      editedAt: entity.editedAt,
      createdAt: entity.createdAt,
      channelId: entity.channelId,
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      parentId: entity.parentId,
    };
  }
}
