import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Role } from '../../../domain/entities/user.entity';

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
    requesterRole?: Role,
  ): Promise<ChannelMemberResponse[]> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    // Admin can view members of any channel without being a member
    if (requesterRole !== Role.ADMIN) {
      const membership =
        await this.channelMemberRepository.findByChannelAndUser(
          channelId,
          requesterId,
        );
      if (!membership)
        throw new ForbiddenException('No eres miembro de este canal');
    }

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
      // El frontend espera OWNER/MEMBER (ADMIN en channel_members = dueño del canal)
      role: member.role === 'ADMIN' ? 'OWNER' : 'MEMBER',
      isOnline: userMap.get(member.userId)?.isOnline ?? false,
      joinedAt: member.joinedAt,
    }));
  }
}
