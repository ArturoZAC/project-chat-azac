import { EmailVerificationEntity } from '../entities/email-verification.entity';

export abstract class EmailVerificationRepository {
  abstract create(
    emailVerification: EmailVerificationEntity,
  ): Promise<EmailVerificationEntity>;
  abstract findByToken(token: string): Promise<EmailVerificationEntity | null>;
  abstract findByUserId(
    userId: string,
  ): Promise<EmailVerificationEntity | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
