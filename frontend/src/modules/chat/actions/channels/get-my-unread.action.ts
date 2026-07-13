/* eslint-disable @typescript-eslint/no-explicit-any */
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

interface UnreadSummary {
  total: number;
  byChannel: Record<string, number>;
}

export const getMyUnreadAction = async (): Promise<UnreadSummary> => {
  try {
    const { data } = await channelsApi.get<ApiResponse<UnreadSummary>>(
      "/my-unread",
    );
    return data.data ?? { total: 0, byChannel: {} };
  } catch {
    return { total: 0, byChannel: {} };
  }
};
