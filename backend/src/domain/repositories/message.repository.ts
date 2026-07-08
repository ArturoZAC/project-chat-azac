import { MessageEntity } from '../entities/message.entity';

export interface CreateMessageData {
  content: string;
  isSystem?: boolean;
  channelId?: string | null;
  conversationId?: string | null;
  senderId: string;
  parentId?: string | null;
}

export interface UpdateMessageData {
  content: string;
}

export interface MessagePaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedMessages {
  data: MessageEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class MessageRepository {
  abstract create(data: CreateMessageData): Promise<MessageEntity>;
  abstract findById(id: string): Promise<MessageEntity | null>;
  abstract findByChannel(
    channelId: string,
    params: MessagePaginationParams,
  ): Promise<PaginatedMessages>;
  abstract update(id: string, data: UpdateMessageData): Promise<MessageEntity>;
  abstract delete(id: string): Promise<void>;
}
