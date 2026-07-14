/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { User } from "@/modules/auth/interfaces/user.interface";

export const getUserAction = async (id: string) => {
  try {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener usuario" };
  }
};
