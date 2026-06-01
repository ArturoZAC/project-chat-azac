import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';

export interface DeleteMessageParams {
  id: string;
  requesterId: string;
}

@Injectable()
export class DeleteMessageUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(params: DeleteMessageParams): Promise<void> {
    const message = await this.messageRepo.findById(params.id);
    if (!message) throw new NotFoundException('Mensaje no encontrado');

    if (message.senderId !== params.requesterId)
      throw new ForbiddenException('No puedes eliminar este mensaje');

    await this.messageRepo.delete(params.id);
  }
}
