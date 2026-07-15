/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";

export const getChannelAction = async (channelId: string) => {
  try {
    const { data } = await api.get<ApiResponse<ChannelBackend>>(
      `/channels/${channelId}`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener canal" };
  }
};
