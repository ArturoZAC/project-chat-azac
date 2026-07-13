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
import { SendMessageUseCase } from '../../../application/use-cases/messages/send-message.usecase';
import { GetMessagesUseCase } from '../../../application/use-cases/messages/get-messages.usecase';
import { EditMessageUseCase } from '../../../application/use-cases/messages/edit-message.usecase';
import { DeleteMessageUseCase } from '../../../application/use-cases/messages/delete-message.usecase';
import { SendMessageDto } from './dtos/send-message.dto';
import { GetMessagesDto } from './dtos/get-messages.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { MessageMapper } from '../../../infrastructure/prisma/mappers/message.mapper';
import { UserMapper } from '../../../infrastructure/prisma/mappers/user.mapper';
import { Auth } from '../decorators/auth.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';
import { ChatGateway } from '../../websocket/chat.gateway';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import type { Request } from 'express';

@Auth()
@Controller('channels/:channelId/messages')
export class MessagesController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly chatGateway: ChatGateway,
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly channelRepo: ChannelRepository,
  ) {}

  @Post()
  async sendMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const message = await this.sendMessageUseCase.execute({
      content: dto.content,
      channelId,
      senderId: user.id,
      parentId: dto.parentId ?? null,
    });

    this.chatGateway.server
      .to(`channel:${channelId}`)
      .emit('message.sent', {
        ...MessageMapper.toResponse(message),
        sender: UserMapper.toResponse(user),
      });

    // Emit notification to all channel members except sender
    const channelMembers = await this.channelMemberRepo.findByChannel(channelId);
    const channelName =
      (await this.channelRepo.findById(channelId))?.name ?? channelId;

    for (const member of channelMembers) {
      if (member.userId === user.id) continue;

      // Emit channel.updated so the /messages page refreshes the preview & unread
      this.chatGateway.server
        .to(`user:${member.userId}`)
        .emit('channel.updated', { channelId });

      this.chatGateway.server
        .to(`user:${member.userId}`)
        .emit('notification.new', {
          id: message.id,
          type: 'channel',
          title: `#${channelName}`,
          message: 'te escribió un mensaje',
          channelName: channelName,
          channelId: channelId,
          conversationId: null,
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

  @Get()
  async getMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Query() query: GetMessagesDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const result = await this.getMessagesUseCase.execute({
      channelId,
      userId: user.id,
      page: query.page,
      limit: query.limit,
    });
    return ResponseInterceptor.success(
      { ...result, data: result.data.map(MessageMapper.toResponse) },
      'Mensajes obtenidos exitosamente',
    );
  }

  @Patch(':messageId')
  async editMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const message = await this.editMessageUseCase.execute({
      id: messageId,
      content: dto.content,
      requesterId: user.id,
    });

    this.chatGateway.server
      .to(`channel:${channelId}`)
      .emit('message.edited', {
        ...MessageMapper.toResponse(message),
        sender: UserMapper.toResponse(user),
      });

    return ResponseInterceptor.success(
      MessageMapper.toResponse(message),
      'Mensaje editado exitosamente',
    );
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    await this.deleteMessageUseCase.execute({
      id: messageId,
      requesterId: user.id,
    });

    this.chatGateway.server
      .to(`channel:${channelId}`)
      .emit('message.deleted', { messageId, channelId });

    return ResponseInterceptor.success(null, 'Mensaje eliminado exitosamente');
  }
}
