import { Injectable } from '@nestjs/common';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';

@Injectable()
export class GetUserMembershipsUseCase {
  constructor(
    private readonly channelMemberRepository: ChannelMemberRepository,
  ) {}

  async execute(userId: string): Promise<string[]> {
    const members = await this.channelMemberRepository.findByUser(userId);
    return members.map((member) => member.channelId);
  }
}
