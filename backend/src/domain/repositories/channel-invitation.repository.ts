import { ChannelInvitationEntity } from '../entities/channel-invitation.entity';

export interface CreateChannelInvitationData {
  token: string;
  channelId: string;
  createdById: string;
  expiresAt: Date;
}

export abstract class ChannelInvitationRepository {
  abstract create(
    data: CreateChannelInvitationData,
  ): Promise<ChannelInvitationEntity>;
  abstract findByToken(
    token: string,
  ): Promise<ChannelInvitationEntity | null>;
  abstract markAsUsed(id: string): Promise<void>;
  abstract findValidByChannel(
    channelId: string,
  ): Promise<ChannelInvitationEntity[]>;
}
