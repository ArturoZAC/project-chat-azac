import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ChannelInvitationRepository } from '../../../domain/repositories/channel-invitation.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import {
  ChannelMemberEntity,
  ChannelMemberRole,
} from '../../../domain/entities/channel-member.entity';
import { MessageEntity } from '../../../domain/entities/message.entity';

export interface AcceptInvitationParams {
  token: string;
  userId: string;
  username: string;
}

export interface AcceptInvitationResult {
  member: ChannelMemberEntity;
  systemMessage: MessageEntity;
}

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationRepo: ChannelInvitationRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly channelRepo: ChannelRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(
    params: AcceptInvitationParams,
  ): Promise<AcceptInvitationResult> {
    const invitation = await this.invitationRepo.findByToken(params.token);
    if (!invitation) throw new NotFoundException('Invitación no encontrada');

    if (invitation.isExpired())
      throw new BadRequestException('Esta invitación ha expirado');

    if (invitation.isUsed())
      throw new BadRequestException('Esta invitación ya fue utilizada');

    const channel = await this.channelRepo.findById(invitation.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const existingMember = await this.channelMemberRepo.findByChannelAndUser(
      invitation.channelId,
      params.userId,
    );
    if (existingMember)
      throw new ConflictException('Ya eres miembro de este canal');

    // Add user as member
    const member = await this.channelMemberRepo.create({
      channelId: invitation.channelId,
      userId: params.userId,
      role: ChannelMemberRole.USER,
    });

    // Mark invitation as used
    await this.invitationRepo.markAsUsed(invitation.id);

    // Create system message: "X se unió al canal"
    const systemMessage = await this.messageRepo.create({
      channelId: invitation.channelId,
      senderId: params.userId,
      content: JSON.stringify({
        type: 'system.join',
        userId: params.userId,
        username: params.username,
      }),
      isSystem: true,
    });

    return { member, systemMessage };
  }
}
