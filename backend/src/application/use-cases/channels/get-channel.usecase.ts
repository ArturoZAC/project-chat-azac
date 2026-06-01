import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelEntity } from '../../../domain/entities/channel.entity';

@Injectable()
export class GetChannelUseCase {
  constructor(private readonly channelRepo: ChannelRepository) {}

  async execute(id: string): Promise<ChannelEntity> {
    const channel = await this.channelRepo.findById(id);
    if (!channel) throw new NotFoundException('Canal no encontrado');
    return channel;
  }
}
