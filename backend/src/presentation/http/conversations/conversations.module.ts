import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { CreateOrGetConversationUseCase } from '../../../application/use-cases/conversations/create-or-get-conversation.usecase';
import { GetUserConversationsUseCase } from '../../../application/use-cases/conversations/get-user-conversations.usecase';
import { GetConversationMessagesUseCase } from '../../../application/use-cases/conversations/get-conversation-messages.usecase';
import { SendConversationMessageUseCase } from '../../../application/use-cases/conversations/send-conversation-message.usecase';
import { EditConversationMessageUseCase } from '../../../application/use-cases/conversations/edit-conversation-message.usecase';
import { DeleteConversationMessageUseCase } from '../../../application/use-cases/conversations/delete-conversation-message.usecase';
import { MarkConversationReadUseCase } from '../../../application/use-cases/conversations/mark-conversation-read.usecase';
import { ChatModule } from '../../websocket/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [ConversationsController],
  providers: [
    CreateOrGetConversationUseCase,
    GetUserConversationsUseCase,
    GetConversationMessagesUseCase,
    SendConversationMessageUseCase,
    EditConversationMessageUseCase,
    DeleteConversationMessageUseCase,
    MarkConversationReadUseCase,
  ],
})
export class ConversationsModule {}
