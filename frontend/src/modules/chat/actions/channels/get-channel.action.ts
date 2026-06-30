/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channel-backend.interface";

export const getChannelAction = async (id: string) => {
  try {
    const { data } = await channelsApi.get<ApiResponse<ChannelBackend>>(`/${id}`);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener el canal" };
  }
};
