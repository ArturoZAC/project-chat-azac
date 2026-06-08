/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";
import { ApiResponse } from "@/shared/interfaces/api.interface";
import { ResetPasswordResponse } from "@/shared/interfaces/auth.interface";

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const resetPasswordAction = async (
  payload: ResetPasswordPayload,
): Promise<ApiResponse<ResetPasswordResponse>> => {
  try {
    const { data } = await authApi.post<ApiResponse<ResetPasswordResponse>>(
      "/reset-password",
      payload,
    );
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
