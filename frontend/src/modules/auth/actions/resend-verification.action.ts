/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";

export const resendVerificationAction = async (email: string) => {
  try {
    const { data } = await authApi.post("/resend-verification", { email });
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
