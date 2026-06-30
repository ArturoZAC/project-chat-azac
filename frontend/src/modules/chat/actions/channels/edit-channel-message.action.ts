/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelMessageBackend } from "@/modules/chat/interfaces/channels/channel-message-backend.interface";

export const editChannelMessageAction = async (
  channelId: string,
  messageId: string,
  content: string,
) => {
  try {
    const { data } = await channelsApi.patch<ApiResponse<ChannelMessageBackend>>(
      `/${channelId}/messages/${messageId}`,
      { content },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al editar mensaje" };
  }
};
