import { IsString, MinLength } from 'class-validator';

export class SendConversationMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
