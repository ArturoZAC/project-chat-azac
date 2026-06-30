/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/modules/auth/api/auth.api";

export const logoutAction = async () => {
  try {
    const { data } = await authApi.post("/logout");
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al cerrar sesión" };
  }
};
