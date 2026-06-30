/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelMessageBackend } from "@/modules/chat/interfaces/channel-message-backend.interface";

export const sendChannelMessageAction = async (
  channelId: string,
  content: string,
  parentId?: string,
) => {
  try {
    const { data } = await channelsApi.post<ApiResponse<ChannelMessageBackend>>(
      `/${channelId}/messages`,
      { content, parentId },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al enviar mensaje" };
  }
};
