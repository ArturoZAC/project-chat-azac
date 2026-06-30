/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const markConversationReadAction = async (conversationId: string) => {
  try {
    const { data } = await conversationsApi.post<ApiResponse<null>>(`/${conversationId}/read`);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al marcar como leído" };
  }
};
