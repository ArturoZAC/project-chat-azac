/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse, PaginatedData } from "@/shared/interfaces/api.interface";
import type { ChannelMessageBackend } from "@/modules/chat/interfaces/channel-message-backend.interface";

export const getChannelMessagesAction = async (
  channelId: string,
  page = 1,
  limit = 20,
) => {
  try {
    const { data } = await channelsApi.get<ApiResponse<PaginatedData<ChannelMessageBackend>>>(
      `/${channelId}/messages`,
      { params: { page, limit } },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener mensajes" };
  }
};
