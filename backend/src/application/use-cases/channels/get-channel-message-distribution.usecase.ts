import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';

export interface UserMessageCount {
  userId: string;
  username: string;
  count: number;
}

@Injectable()
export class GetChannelMessageDistributionUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(channelId: string): Promise<UserMessageCount[]> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    return this.messageRepository.countByChannelGroupedByUser(channelId);
  }
}
