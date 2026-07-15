/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/shared/api/api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface ChannelMemberBackend {
  id: string;
  userId: string;
  username: string;
  role: "OWNER" | "MEMBER" | "GUEST";
  isOnline: boolean;
  joinedAt: string;
}

export const getChannelMembersAction = async (channelId: string) => {
  try {
    const { data } = await api.get<ApiResponse<ChannelMemberBackend[]>>(
      `/channels/${channelId}/members`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener miembros" };
  }
};
