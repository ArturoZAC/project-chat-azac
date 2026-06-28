import { IsString, MinLength } from 'class-validator';

export class EditConversationMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
