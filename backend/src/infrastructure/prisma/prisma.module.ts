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
import { ChannelInvitationRepository } from '../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationPrismaRepository } from './repositories/channel-invitation.prisma.repository';

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
    {
      provide: ChannelInvitationRepository,
      useClass: ChannelInvitationPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    ChannelRepository,
    ChannelMemberRepository,
    MessageRepository,
    ConversationRepository,
    ChannelInvitationRepository,
  ],
})
export class PrismaModule {}
