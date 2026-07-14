/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface UserChannel {
  id: string;
  name: string;
  role: "USER" | "ADMIN";
}

export const getUserChannelsAction = async (userId: string) => {
  try {
    const { data } = await api.get<ApiResponse<UserChannel[]>>(
      `/users/${userId}/channels`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener canales" };
  }
};
