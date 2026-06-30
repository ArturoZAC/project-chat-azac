/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";

export const restoreSessionAction = async () => {
  try {
    const { data } = await authApi.post("/renew");
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "No hay sesión activa" };
  }
};
