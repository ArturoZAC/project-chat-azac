/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const deleteChannelMessageAction = async (
  channelId: string,
  messageId: string,
) => {
  try {
    const { data } = await channelsApi.delete<ApiResponse<null>>(
      `/${channelId}/messages/${messageId}`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al eliminar mensaje" };
  }
};
