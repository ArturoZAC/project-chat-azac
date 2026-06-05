/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";
import { ApiResponse } from "@/shared/interfaces/api.interface";
import { RegisterResponse } from "@/shared/interfaces/auth.interface";

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export const registerAction = async (
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResponse>> => {
  try {
    const { data } = await authApi.post<ApiResponse<RegisterResponse>>("/register", payload);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
