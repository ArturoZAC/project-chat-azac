import { Injectable } from '@nestjs/common';
import {
  ChannelRepository,
  PaginatedChannels,
  ChannelPaginationParams,
} from '../../../domain/repositories/channel.repository';

@Injectable()
export class GetChannelsUseCase {
  constructor(private readonly channelRepo: ChannelRepository) {}

  async execute(params: ChannelPaginationParams): Promise<PaginatedChannels> {
    const page = Math.max(1, params.page);
    const limit = Math.min(params.limit, 100);
    return this.channelRepo.findAll({ page, limit });
  }
}
