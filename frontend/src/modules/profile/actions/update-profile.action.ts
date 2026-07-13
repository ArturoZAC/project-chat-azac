/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface UpdateProfileInput {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const updateProfileAction = async (userId: string, input: UpdateProfileInput) => {
  try {
    const { data } = await api.patch<ApiResponse<any>>(`/users/${userId}`, input);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al actualizar perfil" };
  }
};
