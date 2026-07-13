import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';

export interface MarkChannelReadParams {
  channelId: string;
  userId: string;
}

@Injectable()
export class MarkChannelReadUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: MarkChannelReadParams): Promise<void> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }

    const member = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.userId,
    );
    if (!member) {
      throw new NotFoundException('No eres miembro de este canal');
    }

    await this.channelMemberRepo.updateLastRead(
      params.channelId,
      params.userId,
    );
  }
}
