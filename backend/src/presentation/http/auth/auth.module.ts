import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { VerifyEmailUseCase } from '../../../application/use-cases/auth/verify-email.usecase';
import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.usecase';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';
import { MailModule } from '../../../infrastructure/mail/mail.module';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserPrismaRepository } from '../../../infrastructure/prisma/repositories/user.prisma.repository';
import { EmailVerificationRepository } from '../../../domain/repositories/email-verification.repository';
import { EmailVerificationPrismaRepository } from '../../../infrastructure/prisma/repositories/email-verification.prisma.repository';
import { PasswordResetRepository } from '../../../domain/repositories/password-reset.repository';
import { PasswordResetPrismaRepository } from '../../../infrastructure/prisma/repositories/password-reset.prisma.repository';
import { JwtStrategy } from '../../../infrastructure/auth/jwt.strategy';
import { envs } from '../../../config/envs';
import { PassportModule } from '@nestjs/passport';
import { ResendVerificationUseCase } from '../../../application/use-cases/auth/resend-verification.usecase';

@Global()
@Module({
  imports: [
    PrismaModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: envs.JWT_EXPIRES_IN as any },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ResendVerificationUseCase,
    JwtStrategy,
    { provide: UserRepository, useClass: UserPrismaRepository },
    {
      provide: EmailVerificationRepository,
      useClass: EmailVerificationPrismaRepository,
    },
    {
      provide: PasswordResetRepository,
      useClass: PasswordResetPrismaRepository,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
