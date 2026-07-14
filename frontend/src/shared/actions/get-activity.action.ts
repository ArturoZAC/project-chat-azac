/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface ActivityEntry {
  date: string;
  messages: number;
}

export const getActivityAction = async (
  userId: string,
  from?: string,
  to?: string,
) => {
  try {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await api.get<ApiResponse<ActivityEntry[]>>(
      `/users/${userId}/activity`,
      { params },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener actividad" };
  }
};
