import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface MemberApiData {
  id: string;
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
  joinedAt: string;
}

export const getChannelMembersAction = async (channelId: string) => {
  try {
    const { data } = await channelsApi.get<ApiResponse<MemberApiData[]>>(
      `/${channelId}/members`,
    );
    return data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        data: [],
        message: "Error al obtener miembros",
      }
    );
  }
};
