import { chatApi } from "./chat.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";
import type { ConversationWithDetails, PaginatedMessages, MessageInConversation } from "../interfaces/conversation.interface";
import type { User } from "@/modules/auth/interfaces/user.interface";

// ─── GET /conversations ───────────────────────────────
export async function getConversationsApi(): Promise<
  ApiResponse<ConversationWithDetails[]>
> {
  const { data } = await chatApi.get<ApiResponse<ConversationWithDetails[]>>(
    "/conversations",
  );
  return data;
}

// ─── POST /conversations ──────────────────────────────
export async function createOrGetConversationApi(
  participantId: string,
): Promise<ApiResponse<{ id: string }>> {
  const { data } = await chatApi.post<ApiResponse<{ id: string }>>(
    "/conversations",
    { participantId },
  );
  return data;
}

// ─── GET /conversations/:id/messages ──────────────────
export async function getConversationMessagesApi(
  conversationId: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse<PaginatedMessages>> {
  const { data } = await chatApi.get<ApiResponse<PaginatedMessages>>(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit } },
  );
  return data;
}

// ─── POST /conversations/:id/messages ─────────────────
export async function sendConversationMessageApi(
  conversationId: string,
  content: string,
): Promise<ApiResponse<MessageInConversation>> {
  const { data } = await chatApi.post<ApiResponse<MessageInConversation>>(
    `/conversations/${conversationId}/messages`,
    { content },
  );
  return data;
}

// ─── PATCH /conversations/:conversationId/messages/:messageId ──
export async function editConversationMessageApi(
  conversationId: string,
  messageId: string,
  content: string,
): Promise<ApiResponse<MessageInConversation>> {
  const { data } = await chatApi.patch<ApiResponse<MessageInConversation>>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { content },
  );
  return data;
}

// ─── DELETE /conversations/:conversationId/messages/:messageId ──
export async function deleteConversationMessageApi(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<null>> {
  const { data } = await chatApi.delete<ApiResponse<null>>(
    `/conversations/${conversationId}/messages/${messageId}`,
  );
  return data;
}

// ─── POST /conversations/:id/read ─────────────────────
export async function markConversationReadApi(
  conversationId: string,
): Promise<ApiResponse<null>> {
  const { data } = await chatApi.post<ApiResponse<null>>(
    `/conversations/${conversationId}/read`,
  );
  return data;
}

// ─── GET /users (for sidebar user list) ───────────────
export async function getUsersApi(
  page = 1,
  limit = 50,
): Promise<ApiResponse<{ data: User[]; total: number; page: number; limit: number; totalPages: number }>> {
  const { data } = await chatApi.get<
    ApiResponse<{ data: User[]; total: number; page: number; limit: number; totalPages: number }>
  >("/users", { params: { page, limit } });
  return data;
}
