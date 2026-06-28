import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { SendMessageUseCase } from '../../../application/use-cases/messages/send-message.usecase';
import { GetMessagesUseCase } from '../../../application/use-cases/messages/get-messages.usecase';
import { EditMessageUseCase } from '../../../application/use-cases/messages/edit-message.usecase';
import { DeleteMessageUseCase } from '../../../application/use-cases/messages/delete-message.usecase';

@Module({
  controllers: [MessagesController],
  providers: [
    SendMessageUseCase,
    GetMessagesUseCase,
    EditMessageUseCase,
    DeleteMessageUseCase,
  ],
})
export class MessagesModule {}
