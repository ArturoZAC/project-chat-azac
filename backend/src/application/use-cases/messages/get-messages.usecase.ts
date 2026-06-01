import { Injectable, ForbiddenException } from '@nestjs/common';
import {
  MessageRepository,
  PaginatedMessages,
  MessagePaginationParams,
} from '../../../domain/repositories/message.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';

export interface GetMessagesParams extends MessagePaginationParams {
  channelId: string;
  userId: string;
}

@Injectable()
export class GetMessagesUseCase {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: GetMessagesParams): Promise<PaginatedMessages> {
    const member = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.userId,
    );
    if (!member) throw new ForbiddenException('No eres miembro de este canal');

    const page = Math.max(1, params.page);
    const limit = Math.min(params.limit, 100);

    return this.messageRepo.findByChannel(params.channelId, { page, limit });
  }
}
