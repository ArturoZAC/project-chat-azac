import { ConversationEntity } from '../entities/conversation.entity';
import { MessageEntity } from '../entities/message.entity';

export interface CreateConversationData {
  participantIds: string[];
}

export interface ConversationWithDetails {
  conversation: ConversationEntity;
  participants: Array<{ id: string; username: string }>;
  lastMessage: MessageEntity | null;
  unreadCount: number;
}

export interface ConversationMessagePaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedConversationMessages {
  data: MessageEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class ConversationRepository {
  abstract findById(id: string): Promise<ConversationEntity | null>;
  abstract findByUser(userId: string): Promise<ConversationWithDetails[]>;
  abstract findByParticipants(
    userIds: string[],
  ): Promise<ConversationEntity | null>;
  abstract create(data: CreateConversationData): Promise<ConversationEntity>;
  abstract getMessages(
    conversationId: string,
    params: ConversationMessagePaginationParams,
  ): Promise<PaginatedConversationMessages>;
  abstract isMember(conversationId: string, userId: string): Promise<boolean>;
  abstract markAsRead(conversationId: string, userId: string): Promise<void>;
  abstract getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number>;
  abstract findParticipants(conversationId: string): Promise<string[]>;
}
