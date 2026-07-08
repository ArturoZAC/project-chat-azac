import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { CreateChannelUseCase } from '../../../application/use-cases/channels/create-channel.usecase';
import { GetChannelsUseCase } from '../../../application/use-cases/channels/get-channels.usecase';
import { GetChannelUseCase } from '../../../application/use-cases/channels/get-channel.usecase';
import { UpdateChannelUseCase } from '../../../application/use-cases/channels/update-channel.usecase';
import { DeleteChannelUseCase } from '../../../application/use-cases/channels/delete-channel.usecase';
import { JoinChannelUseCase } from '../../../application/use-cases/channels/join-channel.usecase';
import { LeaveChannelUseCase } from '../../../application/use-cases/channels/leave-channel.usecase';
import { GetUserMembershipsUseCase } from '../../../application/use-cases/channels/get-user-memberships.usecase';
import { GetChannelMembersUseCase } from '../../../application/use-cases/channels/get-channel-members.usecase';

@Module({
  controllers: [ChannelsController],
  providers: [
    CreateChannelUseCase,
    GetChannelsUseCase,
    GetChannelUseCase,
    UpdateChannelUseCase,
    DeleteChannelUseCase,
    JoinChannelUseCase,
    LeaveChannelUseCase,
    GetUserMembershipsUseCase,
    GetChannelMembersUseCase,
  ],
})
export class ChannelsModule {}
