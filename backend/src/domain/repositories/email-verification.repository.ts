import { EmailVerificationEntity } from '../entities/email-verification.entity';

export interface CreateEmailVerificationData {
  token: string;
  expiresAt: Date;
  userId: string;
}

export abstract class EmailVerificationRepository {
  abstract create(
    data: CreateEmailVerificationData,
  ): Promise<EmailVerificationEntity>;
  abstract findByToken(token: string): Promise<EmailVerificationEntity | null>;
  abstract findByUserId(
    userId: string,
  ): Promise<EmailVerificationEntity | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
