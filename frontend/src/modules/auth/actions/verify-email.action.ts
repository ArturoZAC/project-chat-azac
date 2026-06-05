/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "../api/auth.api";

export const verifyEmailAction = async (token: string) => {
  try {
    const { data } = await authApi.get(`/verify-email?token=${token}`);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
