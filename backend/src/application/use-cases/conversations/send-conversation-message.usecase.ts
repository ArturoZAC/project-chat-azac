import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageEntity } from '../../../domain/entities/message.entity';

export interface SendConversationMessageParams {
  conversationId: string;
  content: string;
  senderId: string;
}

@Injectable()
export class SendConversationMessageUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(params: SendConversationMessageParams): Promise<MessageEntity> {
    const conversation = await this.conversationRepo.findById(
      params.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isMember = await this.conversationRepo.isMember(
      params.conversationId,
      params.senderId,
    );
    if (!isMember) {
      throw new ForbiddenException('No eres miembro de esta conversación');
    }

    return this.messageRepo.create({
      content: params.content,
      conversationId: params.conversationId,
      senderId: params.senderId,
    });
  }
}
