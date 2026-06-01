import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { SendMessageUseCase } from '../../../application/use-cases/messages/send-message.usecase';
import { GetMessagesUseCase } from '../../../application/use-cases/messages/get-messages.usecase';
import { EditMessageUseCase } from '../../../application/use-cases/messages/edit-message.usecase';
import { DeleteMessageUseCase } from '../../../application/use-cases/messages/delete-message.usecase';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessagePrismaRepository } from '../../../infrastructure/prisma/repositories/message.prisma.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelMemberPrismaRepository } from '../../../infrastructure/prisma/repositories/channel-member.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [
    SendMessageUseCase,
    GetMessagesUseCase,
    EditMessageUseCase,
    DeleteMessageUseCase,
    { provide: MessageRepository, useClass: MessagePrismaRepository },
    {
      provide: ChannelMemberRepository,
      useClass: ChannelMemberPrismaRepository,
    },
  ],
})
export class MessagesModule {}
