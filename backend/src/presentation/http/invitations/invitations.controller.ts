import { Controller, Post, Param, Req, ParseUUIDPipe } from '@nestjs/common';
import { CreateInvitationUseCase } from '../../../application/use-cases/invitations/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitations/accept-invitation.usecase';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { ChatGateway } from '../../websocket/chat.gateway';
import { Auth } from '../decorators/auth.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';
import type { Request } from 'express';
import { envs } from 'src/config/envs';

@Controller()
export class InvitationsController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Auth()
  @Post('channels/:channelId/invitations')
  async createInvitation(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const invitation = await this.createInvitationUseCase.execute({
      channelId,
      requestedById: user.id,
    });
    const frontendUrl = envs.CLIENT_URL || 'http://localhost:5173';
    return ResponseInterceptor.success(
      {
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        url: `${frontendUrl}/invite/${invitation.token}`,
      },
      'Enlace de invitación generado',
    );
  }

  @Auth()
  @Post('invitations/:token/accept')
  async acceptInvitation(@Param('token') token: string, @Req() req: Request) {
    const user = req.user as UserEntity;
    const result = await this.acceptInvitationUseCase.execute({
      token,
      userId: user.id,
      username: user.username,
    });

    // Emit Socket.IO events to the channel room
    this.chatGateway.server
      .to(`channel:${result.member.channelId}`)
      .emit('message.sent', {
        id: result.systemMessage.id,
        channelId: result.member.channelId,
        content: JSON.stringify({
          type: 'system.join',
          userId: user.id,
          username: user.username,
        }),
        senderId: user.id,
        isSystem: true,
        createdAt: result.systemMessage.createdAt,
      });

    this.chatGateway.server
      .to(`channel:${result.member.channelId}`)
      .emit('channel.member.joined', {
        channelId: result.member.channelId,
        userId: user.id,
        username: user.username,
      });

    return ResponseInterceptor.success(
      {
        channelId: result.member.channelId,
        systemMessageId: result.systemMessage.id,
      },
      'Te uniste al canal',
    );
  }
}
