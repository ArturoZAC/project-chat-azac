import { Controller, Post, Body, Res, Get, Query } from '@nestjs/common';
// import { Response } from 'express';
import type { Response } from 'express';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { VerifyEmailUseCase } from '../../../application/use-cases/auth/verify-email.usecase';
import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.usecase';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { UserMapper } from '../../../infrastructure/prisma/mappers/user.mapper';
import { ResendVerificationUseCase } from '../../../application/use-cases/auth/resend-verification.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return ResponseInterceptor.success(
      UserMapper.toResponse(user),
      'Usuario registrado exitosamente',
    );
  }

  // @Post('login')
  // async login(@Body() dto: LoginDto) {
  //   const user = await this.loginUseCase.execute(dto);
  //   return ResponseInterceptor.success(
  //     UserMapper.toResponse(user),
  //     'Login exitoso',
  //   );
  // }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, userId } = await this.loginUseCase.execute(dto);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    return ResponseInterceptor.success({ userId }, 'Login exitoso');
    // return res.json(ResponseInterceptor.success({ userId }, 'Login exitoso'));
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.verifyEmailUseCase.execute({ token });
    return ResponseInterceptor.success(null, 'Email verificado exitosamente');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(dto);
    return ResponseInterceptor.success(null, 'Email de recuperación enviado');
  }

  // @Post('reset-password')
  // async resetPassword(
  //   @Query('token') token: string,
  //   @Body() dto: ResetPasswordDto,
  // ) {
  //   await this.resetPasswordUseCase.execute({ ...dto, token });
  //   return ResponseInterceptor.success(
  //     null,
  //     'Contraseña actualizada exitosamente',
  //   );
  // }

  @Post('resend-verification')
  async resendVerification(@Body() dto: { email: string }) {
    await this.resendVerificationUseCase.execute(dto);
    return ResponseInterceptor.success(
      null,
      'Correo de verificación reenviado',
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto);
    return ResponseInterceptor.success(
      null,
      'Contraseña actualizada exitosamente',
    );
  }
}
