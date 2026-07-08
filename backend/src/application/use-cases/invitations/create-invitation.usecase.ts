import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelInvitationRepository } from '../../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import * as crypto from 'crypto';

export interface CreateInvitationParams {
  channelId: string;
  requestedById: string;
}

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly invitationRepo: ChannelInvitationRepository,
  ) {}

  async execute(
    params: CreateInvitationParams,
  ): Promise<ChannelInvitationEntity> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.invitationRepo.create({
      token,
      channelId: params.channelId,
      createdById: params.requestedById,
      expiresAt,
    });
  }
}
