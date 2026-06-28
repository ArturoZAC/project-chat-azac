import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageEntity } from '../../../domain/entities/message.entity';

export interface EditConversationMessageParams {
  conversationId: string;
  messageId: string;
  content: string;
  userId: string;
}

@Injectable()
export class EditConversationMessageUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(params: EditConversationMessageParams): Promise<MessageEntity> {
    const message = await this.messageRepo.findById(params.messageId);
    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (message.conversationId !== params.conversationId) {
      throw new NotFoundException('Mensaje no encontrado en esta conversación');
    }

    if (message.senderId !== params.userId) {
      throw new ForbiddenException(
        'No puedes editar un mensaje de otro usuario',
      );
    }

    return this.messageRepo.update(params.messageId, {
      content: params.content,
    });
  }
}
