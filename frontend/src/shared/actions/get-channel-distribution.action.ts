/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface UserMessageCount {
  userId: string;
  username: string;
  count: number;
}

export const getChannelDistributionAction = async (channelId: string) => {
  try {
    const { data } = await api.get<ApiResponse<UserMessageCount[]>>(
      `/channels/${channelId}/message-distribution`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener distribución" };
  }
};
