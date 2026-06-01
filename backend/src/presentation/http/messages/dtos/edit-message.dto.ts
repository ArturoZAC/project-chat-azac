import { IsString, MinLength } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
