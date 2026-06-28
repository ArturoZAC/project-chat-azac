import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationWithDetails } from '../../../domain/repositories/conversation.repository';

@Injectable()
export class GetUserConversationsUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(userId: string): Promise<ConversationWithDetails[]> {
    return this.conversationRepo.findByUser(userId);
  }
}
