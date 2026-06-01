import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageEntity } from '../../../domain/entities/message.entity';

export interface EditMessageParams {
  id: string;
  content: string;
  requesterId: string;
}

@Injectable()
export class EditMessageUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(params: EditMessageParams): Promise<MessageEntity> {
    const message = await this.messageRepo.findById(params.id);
    if (!message) throw new NotFoundException('Mensaje no encontrado');

    if (message.senderId !== params.requesterId)
      throw new ForbiddenException('No puedes editar este mensaje');

    return this.messageRepo.update(params.id, { content: params.content });
  }
}
