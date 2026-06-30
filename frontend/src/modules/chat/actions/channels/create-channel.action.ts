/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channel-backend.interface";

interface CreateChannelPayload {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export const createChannelAction = async (payload: CreateChannelPayload) => {
  try {
    const { data } = await channelsApi.post<ApiResponse<ChannelBackend>>("/", payload);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al crear canal" };
  }
};
