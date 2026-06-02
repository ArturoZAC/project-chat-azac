import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserPrismaRepository } from '../../infrastructure/prisma/repositories/user.prisma.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessagePrismaRepository } from '../../infrastructure/prisma/repositories/message.prisma.repository';
import { ChannelMemberRepository } from '../../domain/repositories/channel-member.repository';
import { ChannelMemberPrismaRepository } from '../../infrastructure/prisma/repositories/channel-member.prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    ChatGateway,
    { provide: UserRepository, useClass: UserPrismaRepository },
    { provide: MessageRepository, useClass: MessagePrismaRepository },
    {
      provide: ChannelMemberRepository,
      useClass: ChannelMemberPrismaRepository,
    },
  ],
})
export class ChatModule {}
