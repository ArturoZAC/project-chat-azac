import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { PaginatedConversationMessages } from '../../../domain/repositories/conversation.repository';

export interface GetConversationMessagesParams {
  conversationId: string;
  userId: string;
  page: number;
  limit: number;
}

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(
    params: GetConversationMessagesParams,
  ): Promise<PaginatedConversationMessages> {
    const conversation = await this.conversationRepo.findById(
      params.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isMember = await this.conversationRepo.isMember(
      params.conversationId,
      params.userId,
    );
    if (!isMember) {
      throw new ForbiddenException('No eres miembro de esta conversación');
    }

    return this.conversationRepo.getMessages(params.conversationId, {
      page: params.page,
      limit: params.limit,
    });
  }
}
