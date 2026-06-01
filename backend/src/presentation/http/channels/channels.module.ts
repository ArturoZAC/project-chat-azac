import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { CreateChannelUseCase } from '../../../application/use-cases/channels/create-channel.usecase';
import { GetChannelsUseCase } from '../../../application/use-cases/channels/get-channels.usecase';
import { GetChannelUseCase } from '../../../application/use-cases/channels/get-channel.usecase';
import { UpdateChannelUseCase } from '../../../application/use-cases/channels/update-channel.usecase';
import { DeleteChannelUseCase } from '../../../application/use-cases/channels/delete-channel.usecase';
import { JoinChannelUseCase } from '../../../application/use-cases/channels/join-channel.usecase';
import { LeaveChannelUseCase } from '../../../application/use-cases/channels/leave-channel.usecase';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelPrismaRepository } from '../../../infrastructure/prisma/repositories/channel.prisma.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelMemberPrismaRepository } from '../../../infrastructure/prisma/repositories/channel-member.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ChannelsController],
  providers: [
    CreateChannelUseCase,
    GetChannelsUseCase,
    GetChannelUseCase,
    UpdateChannelUseCase,
    DeleteChannelUseCase,
    JoinChannelUseCase,
    LeaveChannelUseCase,
    { provide: ChannelRepository, useClass: ChannelPrismaRepository },
    {
      provide: ChannelMemberRepository,
      useClass: ChannelMemberPrismaRepository,
    },
  ],
})
export class ChannelsModule {}
