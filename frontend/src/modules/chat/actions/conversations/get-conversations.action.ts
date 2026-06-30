/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ConversationWithDetails } from "@/modules/chat/interfaces/conversation.interface";

export const getConversationsAction = async () => {
  try {
    const { data } = await conversationsApi.get<ApiResponse<ConversationWithDetails[]>>("/");
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al obtener conversaciones" };
  }
};
