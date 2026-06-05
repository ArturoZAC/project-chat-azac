export interface LoginResponse {
  success: boolean;
  data: { userId: string };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: { userId: string };
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  data: null;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: null;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  data: null;
  message: string;
}
