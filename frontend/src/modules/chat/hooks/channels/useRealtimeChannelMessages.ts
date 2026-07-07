"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";

interface MessagePayload {
  id: string;
  content: string;
  channelId: string;
  conversationId: string | null;
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
 * Keeps channel messages in sync via Socket.IO.
 */
export function useRealtimeChannelMessages(channelId: string | undefined) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(["messages", channelId], (old: MessagePayload[] | undefined) => {
        if (!old) return [data];
        if (old.some((m) => m.id === data.id)) return old;
        return [...old, data];
      });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
    [channelId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(["messages", channelId], (old: MessagePayload[] | undefined) => {
        if (!old) return old;
        return old.map((m) => (m.id === data.id ? data : m));
      });
    },
    [channelId, queryClient],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; channelId: string }) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(["messages", channelId], (old: MessagePayload[] | undefined) => {
        if (!old) return old;
        return old.filter((m) => m.id !== data.messageId);
      });
    },
    [channelId, queryClient],
  );

  useSocketEvents({
    "message.sent": handleMessageSent,
    "message.edited": handleMessageEdited,
    "message.deleted": handleMessageDeleted,
  });

  // Auto-join room when channelId changes
  useEffect(() => {
    const socket = getSocket();
    if (socket && channelId) {
      socket.emit("channel.join", { channelId });
    }
  }, [channelId]);

  return {
    joinChannel: () => {
      const socket = getSocket();
      if (socket && channelId) {
        socket.emit("channel.join", { channelId });
      }
    },
  };
}
