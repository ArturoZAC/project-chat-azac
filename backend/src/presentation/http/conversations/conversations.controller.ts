import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { CreateOrGetConversationUseCase } from '../../../application/use-cases/conversations/create-or-get-conversation.usecase';
import { GetUserConversationsUseCase } from '../../../application/use-cases/conversations/get-user-conversations.usecase';
import { GetConversationMessagesUseCase } from '../../../application/use-cases/conversations/get-conversation-messages.usecase';
import { SendConversationMessageUseCase } from '../../../application/use-cases/conversations/send-conversation-message.usecase';
import { EditConversationMessageUseCase } from '../../../application/use-cases/conversations/edit-conversation-message.usecase';
import { DeleteConversationMessageUseCase } from '../../../application/use-cases/conversations/delete-conversation-message.usecase';
import { MarkConversationReadUseCase } from '../../../application/use-cases/conversations/mark-conversation-read.usecase';
import { CreateOrGetConversationDto } from './dtos/create-or-get-conversation.dto';
import { SendConversationMessageDto } from './dtos/send-conversation-message.dto';
import { EditConversationMessageDto } from './dtos/edit-conversation-message.dto';
import { GetConversationMessagesDto } from './dtos/get-conversation-messages.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { ConversationMapper } from '../../../infrastructure/prisma/mappers/prisma-conversation.mapper';
import { MessageMapper } from '../../../infrastructure/prisma/mappers/message.mapper';
import { UserMapper } from '../../../infrastructure/prisma/mappers/user.mapper';
import { Auth } from '../decorators/auth.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ChatGateway } from '../../websocket/chat.gateway';
import type { Request } from 'express';

@Auth()
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly createOrGetConversationUseCase: CreateOrGetConversationUseCase,
    private readonly getUserConversationsUseCase: GetUserConversationsUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
    private readonly sendConversationMessageUseCase: SendConversationMessageUseCase,
    private readonly editConversationMessageUseCase: EditConversationMessageUseCase,
    private readonly deleteConversationMessageUseCase: DeleteConversationMessageUseCase,
    private readonly markConversationReadUseCase: MarkConversationReadUseCase,
    private readonly chatGateway: ChatGateway,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  @Post()
  async createOrGetConversation(
    @Body() dto: CreateOrGetConversationDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const conversation = await this.createOrGetConversationUseCase.execute({
      currentUserId: user.id,
      participantId: dto.participantId,
    });
    return ResponseInterceptor.success(
      ConversationMapper.toResponse(conversation),
      'Conversación obtenida exitosamente',
    );
  }

  @Get()
  async getUserConversations(@Req() req: Request) {
    const user = req.user as UserEntity;
    const conversations = await this.getUserConversationsUseCase.execute(
      user.id,
    );
    return ResponseInterceptor.success(
      conversations.map((conv) => ConversationMapper.toDetailsResponse(conv)),
      'Conversaciones obtenidas exitosamente',
    );
  }

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() query: GetConversationMessagesDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const result = await this.getConversationMessagesUseCase.execute({
      conversationId,
      userId: user.id,
      page: query.page,
      limit: query.limit,
    });
    return ResponseInterceptor.success(
      { ...result, data: result.data.map(MessageMapper.toResponse) },
      'Mensajes obtenidos exitosamente',
    );
  }

  @Post(':conversationId/messages')
  async sendMessage(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendConversationMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const message = await this.sendConversationMessageUseCase.execute({
      conversationId,
      content: dto.content,
      senderId: user.id,
    });

    // Emit to conversation room (existing behavior)
    this.chatGateway.server
      .to(`conversation:${conversationId}`)
      .emit('conversation.message.sent', {
        ...MessageMapper.toResponse(message),
        sender: UserMapper.toResponse(user),
      });

    // Emit to each participant's user room so /messages page refreshes
    const participantIds =
      await this.conversationRepository.findParticipants(conversationId);
    for (const participantId of participantIds) {
      this.chatGateway.server
        .to(`user:${participantId}`)
        .emit('conversation.updated', { conversationId });
    }

    // Emit notification to the other participant
    const otherParticipantId = participantIds.find((id) => id !== user.id);
    if (otherParticipantId) {
      this.chatGateway.server
        .to(`user:${otherParticipantId}`)
        .emit('notification.new', {
          id: message.id,
          type: 'dm',
          title: user.username,
          message: 'te envió un mensaje',
          channelName: null,
          channelId: null,
          conversationId: conversationId,
          senderId: user.id,
          senderUsername: user.username,
          createdAt: message.createdAt,
        });
    }

    return ResponseInterceptor.success(
      MessageMapper.toResponse(message),
      'Mensaje enviado exitosamente',
    );
  }

  @Patch(':conversationId/messages/:messageId')
  async editMessage(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditConversationMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const message = await this.editConversationMessageUseCase.execute({
      conversationId,
      messageId,
      content: dto.content,
      userId: user.id,
    });

    this.chatGateway.server
      .to(`conversation:${conversationId}`)
      .emit('conversation.message.edited', {
        ...MessageMapper.toResponse(message),
        sender: UserMapper.toResponse(user),
      });

    return ResponseInterceptor.success(
      MessageMapper.toResponse(message),
      'Mensaje editado exitosamente',
    );
  }

  @Delete(':conversationId/messages/:messageId')
  async deleteMessage(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    await this.deleteConversationMessageUseCase.execute({
      conversationId,
      messageId,
      userId: user.id,
    });

    this.chatGateway.server
      .to(`conversation:${conversationId}`)
      .emit('conversation.message.deleted', { messageId, conversationId });

    return ResponseInterceptor.success(null, 'Mensaje eliminado exitosamente');
  }

  @Post(':conversationId/read')
  async markAsRead(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    await this.markConversationReadUseCase.execute({
      conversationId,
      userId: user.id,
    });
    return ResponseInterceptor.success(null, 'Conversación marcada como leída');
  }
}
