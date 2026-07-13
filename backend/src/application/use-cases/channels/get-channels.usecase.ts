import { Injectable } from '@nestjs/common';
import {
  ChannelRepository,
  PaginatedChannels,
  ChannelPaginationParams,
} from '../../../domain/repositories/channel.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { ChannelEntity } from '../../../domain/entities/channel.entity';
import { MessageEntity } from '../../../domain/entities/message.entity';

interface ChannelWithLastMessage {
  channel: ChannelEntity;
  lastMessage: MessageEntity | null;
}

export interface PaginatedChannelsWithLastMessage {
  data: ChannelWithLastMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetChannelsUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(
    params: ChannelPaginationParams,
  ): Promise<PaginatedChannelsWithLastMessage> {
    const page = Math.max(1, params.page);
    const limit = Math.min(params.limit, 100);

    const result = await this.channelRepo.findAll({ page, limit });

    const dataWithLastMessage = await Promise.all(
      result.data.map(async (channel) => {
        const lastMessage = await this.messageRepo.findLastByChannel(
          channel.id,
        );
        return { channel, lastMessage };
      }),
    );

    return {
      data: dataWithLastMessage,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
