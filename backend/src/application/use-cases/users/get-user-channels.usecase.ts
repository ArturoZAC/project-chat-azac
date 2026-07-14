import { Injectable } from '@nestjs/common';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';

export interface UserChannelResult {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

@Injectable()
export class GetUserChannelsUseCase {
  constructor(
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly channelRepo: ChannelRepository,
  ) {}

  async execute(userId: string): Promise<UserChannelResult[]> {
    const memberships = await this.channelMemberRepo.findByUser(userId);

    const channels = await Promise.all(
      memberships.map(async (membership) => {
        const channel = await this.channelRepo.findById(membership.channelId);
        return {
          id: membership.channelId,
          name: channel?.name ?? 'Canal eliminado',
          role: membership.role,
        };
      }),
    );

    return channels;
  }
}
