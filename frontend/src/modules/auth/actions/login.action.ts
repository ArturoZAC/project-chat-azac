/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";

interface LoginPayload {
  email: string;
  password: string;
}

export const loginAction = async (payload: LoginPayload) => {
  try {
    const { data } = await authApi.post("/login", payload);
    return data;
  } catch (error: any) {
    console.log(error);

    return error.response?.data;
  }
};
