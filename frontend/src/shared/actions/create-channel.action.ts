/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";

export interface CreateChannelInput {
  name: string;
  description?: string | null;
  isPrivate?: boolean;
}

export const createChannelAction = async (input: CreateChannelInput) => {
  try {
    const { data } = await api.post<ApiResponse<ChannelBackend>>("/channels", input);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al crear canal" };
  }
};
