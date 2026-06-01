import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';

export interface LeaveChannelParams {
  channelId: string;
  userId: string;
}

@Injectable()
export class LeaveChannelUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: LeaveChannelParams): Promise<void> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    if (channel.createdById === params.userId)
      throw new ForbiddenException('El creador no puede abandonar el canal');

    const member = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.userId,
    );
    if (!member) throw new NotFoundException('No eres miembro de este canal');

    await this.channelMemberRepo.delete(params.channelId, params.userId);
  }
}
