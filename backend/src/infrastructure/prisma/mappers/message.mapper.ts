import { Message as PrismaMessage } from '../../../../generated/prisma';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { CreateMessageData } from '../../../domain/repositories/message.repository';

export class MessageMapper {
  static toDomain(prisma: PrismaMessage): MessageEntity {
    return new MessageEntity({
      id: prisma.id,
      content: prisma.content,
      isEdited: prisma.isEdited,
      editedAt: prisma.editedAt,
      createdAt: prisma.createdAt,
      channelId: prisma.channelId,
      senderId: prisma.senderId,
      parentId: prisma.parentId,
    });
  }

  static toPrisma(entity: MessageEntity) {
    return {
      id: entity.id,
      content: entity.content,
      isEdited: entity.isEdited,
      editedAt: entity.editedAt,
      createdAt: entity.createdAt,
      channelId: entity.channelId,
      senderId: entity.senderId,
      parentId: entity.parentId,
    };
  }

  static toCreatePrisma(data: CreateMessageData) {
    return {
      content: data.content,
      channelId: data.channelId,
      senderId: data.senderId,
      parentId: data.parentId ?? null,
    };
  }

  static toResponse(entity: MessageEntity) {
    return {
      id: entity.id,
      content: entity.content,
      isEdited: entity.isEdited,
      editedAt: entity.editedAt,
      createdAt: entity.createdAt,
      channelId: entity.channelId,
      senderId: entity.senderId,
      parentId: entity.parentId,
    };
  }
}
