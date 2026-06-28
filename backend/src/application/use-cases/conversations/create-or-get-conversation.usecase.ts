import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { ConversationEntity } from '../../../domain/entities/conversation.entity';

export interface CreateOrGetConversationParams {
  currentUserId: string;
  participantId: string;
}

@Injectable()
export class CreateOrGetConversationUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(
    params: CreateOrGetConversationParams,
  ): Promise<ConversationEntity> {
    // Validate that the participant exists
    const participant = await this.userRepo.findById(params.participantId);
    if (!participant) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Cannot DM yourself
    if (params.currentUserId === params.participantId) {
      throw new NotFoundException(
        'No puedes iniciar una conversación contigo mismo',
      );
    }

    // Check if conversation already exists
    const existing = await this.conversationRepo.findByParticipants([
      params.currentUserId,
      params.participantId,
    ]);

    if (existing) {
      return existing;
    }

    // Create new conversation
    return this.conversationRepo.create({
      participantIds: [params.currentUserId, params.participantId],
    });
  }
}
