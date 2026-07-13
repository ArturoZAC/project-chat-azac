"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";
import { useChatStore } from "@/modules/chat/store/chat.store";

interface MessagePayload {
  id: string;
  content: string;
  conversationId: string;
  channelId: string | null;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  parentId: string | null;
}

interface PaginatedMessages {
  data: MessagePayload[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Keeps conversation (DM) messages in sync via Socket.IO.
 */
export function useRealtimeConversationMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: PaginatedMessages | undefined) => {
          if (!old) {
            return { data: [data], total: 1, page: 1, limit: 50, totalPages: 1 };
          }
          if (old.data?.some((existingMessage) => existingMessage.id === data.id)) return old;
          // Cache stores newest-first, so prepend
          return { ...old, data: [data, ...old.data], total: old.total + 1 };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Only invalidate unread if the user is NOT actively viewing this conversation
      const activeConversationId = useChatStore.getState().activeConversationId;
      if (data.conversationId !== activeConversationId) {
        queryClient.invalidateQueries({ queryKey: ["unread"] });
      }
    },
    [conversationId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: PaginatedMessages | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((existingMessage) =>
              existingMessage.id === data.id ? data : existingMessage,
            ),
          };
        },
      );
    },
    [conversationId, queryClient],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: PaginatedMessages | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((existingMessage) => existingMessage.id !== data.messageId),
            total: old.total - 1,
          };
        },
      );
    },
    [conversationId, queryClient],
  );

  useSocketEvents({
    "conversation.message.sent": handleMessageSent,
    "conversation.message.edited": handleMessageEdited,
    "conversation.message.deleted": handleMessageDeleted,
  });

  // Auto-join room when conversationId changes
  useEffect(() => {
    const socket = getSocket();
    if (socket && conversationId) {
      socket.emit("conversation.join", { conversationId });
    }
  }, [conversationId]);
}
