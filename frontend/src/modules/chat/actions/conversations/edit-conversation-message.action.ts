/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { MessageInConversation } from "@/modules/chat/interfaces/conversations/conversation.interface";

export const editConversationMessageAction = async (
  conversationId: string,
  messageId: string,
  content: string,
) => {
  try {
    const { data } = await conversationsApi.patch<ApiResponse<MessageInConversation>>(
      `/${conversationId}/messages/${messageId}`,
      { content },
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al editar mensaje" };
  }
};
