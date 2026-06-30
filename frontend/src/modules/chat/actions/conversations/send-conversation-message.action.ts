/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { MessageInConversation } from "@/modules/chat/interfaces/conversation.interface";

export const sendConversationMessageAction = async (
  conversationId: string,
  content: string,
) => {
  try {
    const { data } = await conversationsApi.post<ApiResponse<MessageInConversation>>(
      `/${conversationId}/messages`,
      { content },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al enviar mensaje" };
  }
};
