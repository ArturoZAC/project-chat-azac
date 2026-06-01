import { Injectable, ConflictException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelEntity } from '../../../domain/entities/channel.entity';
import { ChannelMemberRole } from '../../../domain/entities/channel-member.entity';

export interface CreateChannelParams {
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
}

@Injectable()
export class CreateChannelUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  // async execute(params: CreateChannelParams): Promise<ChannelEntity> {
  //   const channels = await this.channelRepo.findAll();
  //   const exists = channels.find((c) => c.name === params.name);
  //   if (exists) throw new ConflictException('El canal ya existe');

  //   const channel = await this.channelRepo.create({
  //     name: params.name,
  //     description: params.description,
  //     isPrivate: params.isPrivate,
  //     createdById: params.createdById,
  //   });

  //   await this.channelMemberRepo.create({
  //     channelId: channel.id,
  //     userId: params.createdById,
  //     role: ChannelMemberRole.ADMIN,
  //   });

  //   return channel;
  // }

  async execute(params: CreateChannelParams): Promise<ChannelEntity> {
    const existing = await this.channelRepo.findByName(params.name);
    if (existing) throw new ConflictException('El canal ya existe');

    const channel = await this.channelRepo.create({
      name: params.name,
      description: params.description,
      isPrivate: params.isPrivate,
      createdById: params.createdById,
    });

    await this.channelMemberRepo.create({
      channelId: channel.id,
      userId: params.createdById,
      role: ChannelMemberRole.ADMIN,
    });

    return channel;
  }
}
