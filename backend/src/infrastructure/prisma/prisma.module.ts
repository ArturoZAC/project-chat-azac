import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { ChannelRepository } from '../../domain/repositories/channel.repository';
import { ChannelPrismaRepository } from './repositories/channel.prisma.repository';
import { ChannelMemberRepository } from '../../domain/repositories/channel-member.repository';
import { ChannelMemberPrismaRepository } from './repositories/channel-member.prisma.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessagePrismaRepository } from './repositories/message.prisma.repository';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { ConversationPrismaRepository } from './repositories/conversation.prisma.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: UserRepository, useClass: UserPrismaRepository },
    { provide: ChannelRepository, useClass: ChannelPrismaRepository },
    {
      provide: ChannelMemberRepository,
      useClass: ChannelMemberPrismaRepository,
    },
    { provide: MessageRepository, useClass: MessagePrismaRepository },
    { provide: ConversationRepository, useClass: ConversationPrismaRepository },
  ],
  exports: [
    PrismaService,
    UserRepository,
    ChannelRepository,
    ChannelMemberRepository,
    MessageRepository,
    ConversationRepository,
  ],
})
export class PrismaModule {}
