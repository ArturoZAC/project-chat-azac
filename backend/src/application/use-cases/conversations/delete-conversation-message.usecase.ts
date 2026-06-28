import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';

export interface DeleteConversationMessageParams {
  conversationId: string;
  messageId: string;
  userId: string;
}

@Injectable()
export class DeleteConversationMessageUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(params: DeleteConversationMessageParams): Promise<void> {
    const message = await this.messageRepo.findById(params.messageId);
    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (message.conversationId !== params.conversationId) {
      throw new NotFoundException('Mensaje no encontrado en esta conversación');
    }

    if (message.senderId !== params.userId) {
      throw new ForbiddenException(
        'No puedes eliminar un mensaje de otro usuario',
      );
    }

    await this.messageRepo.delete(params.messageId);
  }
}
