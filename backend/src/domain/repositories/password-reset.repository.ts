import { PasswordResetEntity } from '../entities/password-reset.entity';

export abstract class PasswordResetRepository {
  abstract create(
    passwordReset: PasswordResetEntity,
  ): Promise<PasswordResetEntity>;
  abstract findByToken(token: string): Promise<PasswordResetEntity | null>;
  abstract findByUserId(userId: string): Promise<PasswordResetEntity | null>;
  abstract markAsUsed(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
