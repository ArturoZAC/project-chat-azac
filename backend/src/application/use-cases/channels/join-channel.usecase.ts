import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import {
  ChannelMemberEntity,
  ChannelMemberRole,
} from '../../../domain/entities/channel-member.entity';

export interface JoinChannelParams {
  channelId: string;
  userId: string;
}

@Injectable()
export class JoinChannelUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: JoinChannelParams): Promise<ChannelMemberEntity> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    if (channel.isPrivate)
      throw new ForbiddenException(
        'No puedes unirte a un canal privado directamente',
      );

    const existing = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.userId,
    );
    if (existing) throw new ConflictException('Ya eres miembro de este canal');

    return this.channelMemberRepo.create({
      channelId: params.channelId,
      userId: params.userId,
      role: ChannelMemberRole.USER,
    });
  }
}
