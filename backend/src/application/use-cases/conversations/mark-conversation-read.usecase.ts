import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';

export interface MarkConversationReadParams {
  conversationId: string;
  userId: string;
}

@Injectable()
export class MarkConversationReadUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(params: MarkConversationReadParams): Promise<void> {
    const conversation = await this.conversationRepo.findById(
      params.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    await this.conversationRepo.markAsRead(
      params.conversationId,
      params.userId,
    );
  }
}
