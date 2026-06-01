import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelEntity } from '../../../domain/entities/channel.entity';

export interface UpdateChannelParams {
  id: string;
  requesterId: string;
  name?: string;
  description?: string | null;
  isPrivate?: boolean;
}

@Injectable()
export class UpdateChannelUseCase {
  constructor(private readonly channelRepo: ChannelRepository) {}

  async execute(params: UpdateChannelParams): Promise<ChannelEntity> {
    const channel = await this.channelRepo.findById(params.id);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    if (channel.createdById !== params.requesterId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar este canal',
      );

    return this.channelRepo.update(params.id, {
      name: params.name,
      description: params.description,
      isPrivate: params.isPrivate,
    });
  }
}
