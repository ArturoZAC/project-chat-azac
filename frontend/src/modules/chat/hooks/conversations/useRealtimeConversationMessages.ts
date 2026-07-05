"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";

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

/**
 * Keeps conversation (DM) messages in sync via Socket.IO.
 */
export function useRealtimeConversationMessages(
  conversationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return [data];
          if (old.some((m) => m.id === data.id)) return old;
          return [...old, data];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    },
    [conversationId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.map((m) => (m.id === data.id ? data : m));
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
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.filter((m) => m.id !== data.messageId);
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
