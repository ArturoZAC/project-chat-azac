import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';

export interface ChannelMemberResponse {
  id: string;
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
  joinedAt: Date;
}

@Injectable()
export class GetChannelMembersUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelMemberRepository: ChannelMemberRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    channelId: string,
    requesterId: string,
  ): Promise<ChannelMemberResponse[]> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const membership =
      await this.channelMemberRepository.findByChannelAndUser(
        channelId,
        requesterId,
      );
    if (!membership)
      throw new ForbiddenException('No eres miembro de este canal');

    const members =
      await this.channelMemberRepository.findByChannel(channelId);
    const userIds = members.map((member) => member.userId);
    const users = await Promise.all(
      userIds.map((userId) => this.userRepository.findById(userId)),
    );
    const userMap = new Map(
      users.filter(Boolean).map((user) => [user!.id, user!]),
    );

    return members.map((member) => ({
      id: member.id,
      userId: member.userId,
      username: userMap.get(member.userId)?.username ?? 'Usuario',
      role: member.role,
      isOnline: userMap.get(member.userId)?.isOnline ?? false,
      joinedAt: member.joinedAt,
    }));
  }
}
