/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";
import { ApiResponse } from "@/shared/interfaces/api.interface";
import { ForgotPasswordResponse } from "@/modules/auth/interfaces/auth.interface";

interface ForgotPasswordPayload {
  email: string;
}

export const forgotPasswordAction = async (
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  try {
    const { data } = await authApi.post<ApiResponse<ForgotPasswordResponse>>(
      "/forgot-password",
      payload,
    );
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
