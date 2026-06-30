/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse, PaginatedData } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";

export const getChannelsAction = async (page = 1, limit = 20) => {
  try {
    const { data } = await channelsApi.get<ApiResponse<PaginatedData<ChannelBackend>>>("/", {
      params: { page, limit },
    });
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener canales" };
  }
};
