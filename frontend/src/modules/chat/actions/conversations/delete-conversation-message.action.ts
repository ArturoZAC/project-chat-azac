/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationsApi } from "@/modules/chat/api/conversations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const deleteConversationMessageAction = async (
  conversationId: string,
  messageId: string,
) => {
  try {
    const { data } = await conversationsApi.delete<ApiResponse<null>>(
      `/${conversationId}/messages/${messageId}`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al eliminar mensaje" };
  }
};
