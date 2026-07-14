/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";

export interface PaginatedChannelsResponse {
  data: ChannelBackend[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getChannelsAction = async (page = 1, limit = 50) => {
  try {
    const { data } = await api.get<ApiResponse<PaginatedChannelsResponse>>("/channels", {
      params: { page, limit },
    });
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener canales" };
  }
};
