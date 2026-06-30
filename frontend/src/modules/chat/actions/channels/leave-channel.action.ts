/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const leaveChannelAction = async (channelId: string) => {
  try {
    const { data } = await channelsApi.delete<ApiResponse<null>>(`/${channelId}/leave`);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al salir del canal" };
  }
};
