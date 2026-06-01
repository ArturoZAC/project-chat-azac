import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { MessageEntity } from '../../../domain/entities/message.entity';

export interface SendMessageParams {
  content: string;
  channelId: string;
  senderId: string;
  parentId?: string | null;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: SendMessageParams): Promise<MessageEntity> {
    const member = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.senderId,
    );
    if (!member) throw new ForbiddenException('No eres miembro de este canal');

    return this.messageRepo.create({
      content: params.content,
      channelId: params.channelId,
      senderId: params.senderId,
      parentId: params.parentId ?? null,
    });
  }
}
