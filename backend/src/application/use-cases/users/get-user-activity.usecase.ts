import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../../domain/repositories/message.repository';

export interface ActivityEntry {
  date: string;
  messages: number;
}

@Injectable()
export class GetUserActivityUseCase {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<ActivityEntry[]> {
    const rows = await this.messageRepo.countByUserInRange(userId, from, to);
    return rows.map((row) => ({
      date: row.date,
      messages: row.count,
    }));
  }
}
