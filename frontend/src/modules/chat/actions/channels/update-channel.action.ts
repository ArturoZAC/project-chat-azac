/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channel-backend.interface";

interface UpdateChannelPayload {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export const updateChannelAction = async (id: string, payload: UpdateChannelPayload) => {
  try {
    const { data } = await channelsApi.patch<ApiResponse<ChannelBackend>>(`/${id}`, payload);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al actualizar canal" };
  }
};
