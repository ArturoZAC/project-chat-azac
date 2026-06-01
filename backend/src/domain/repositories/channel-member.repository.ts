import {
  ChannelMemberEntity,
  ChannelMemberRole,
} from '../entities/channel-member.entity';

export interface CreateChannelMemberData {
  channelId: string;
  userId: string;
  role: ChannelMemberRole;
}

export abstract class ChannelMemberRepository {
  abstract create(data: CreateChannelMemberData): Promise<ChannelMemberEntity>;
  abstract findByChannelAndUser(
    channelId: string,
    userId: string,
  ): Promise<ChannelMemberEntity | null>;
  abstract findByChannel(channelId: string): Promise<ChannelMemberEntity[]>;
  abstract findByUser(userId: string): Promise<ChannelMemberEntity[]>;
  abstract updateLastRead(channelId: string, userId: string): Promise<void>;
  abstract delete(channelId: string, userId: string): Promise<void>;
}
