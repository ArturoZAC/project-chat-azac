/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { User } from "@/modules/auth/interfaces/user.interface";

export const getUsersAction = async (page = 1, limit = 50) => {
  try {
    const { data } = await api.get<
      ApiResponse<{ data: User[]; total: number; page: number; limit: number; totalPages: number }>
    >("/users", { params: { page, limit } });
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener usuarios" };
  }
};
