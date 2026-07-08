import { IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  channelId: string;
}
