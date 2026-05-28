import { PasswordResetEntity } from '../entities/password-reset.entity';

export interface CreatePasswordResetData {
  token: string;
  expiresAt: Date;
  userId: string;
}

export abstract class PasswordResetRepository {
  abstract create(data: CreatePasswordResetData): Promise<PasswordResetEntity>;
  abstract findByToken(token: string): Promise<PasswordResetEntity | null>;
  abstract findByUserId(userId: string): Promise<PasswordResetEntity | null>;
  abstract markAsUsed(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
