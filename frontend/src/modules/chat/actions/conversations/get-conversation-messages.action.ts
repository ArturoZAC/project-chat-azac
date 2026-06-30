/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { PaginatedMessages } from "@/modules/chat/interfaces/conversation.interface";

export const getConversationMessagesAction = async (
  conversationId: string,
  page = 1,
  limit = 20,
) => {
  try {
    const { data } = await conversationsApi.get<ApiResponse<PaginatedMessages>>(
      `/${conversationId}/messages`,
      { params: { page, limit } },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener mensajes" };
  }
};
