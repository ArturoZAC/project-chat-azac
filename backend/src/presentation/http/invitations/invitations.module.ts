import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { CreateInvitationUseCase } from '../../../application/use-cases/invitations/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitations/accept-invitation.usecase';
import { ChatModule } from '../../websocket/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [InvitationsController],
  providers: [CreateInvitationUseCase, AcceptInvitationUseCase],
})
export class InvitationsModule {}
