"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";
import { Message } from "../../interfaces/message.interface";

interface MessagePayload {
  id: string;
  content: string;
  channelId: string;
  conversationId: string | null;
  senderId: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  parentId: string | null;
  isSystem?: boolean;
}

/**
 * Keeps channel messages in sync via Socket.IO.
 */
export function useRealtimeChannelMessages(channelId: string | undefined) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      const formatData: Message = {
        id: data.id,
        content: data.content,
        isSystem: data.isSystem ?? false,
        author: data.sender
          ? {
              id: data.sender.id,
              username: data.sender.username,
              avatarUrl: data.sender.avatarUrl ?? null,
            }
          : {
              id: data.senderId,
              username: "",
              avatarUrl: null,
            },
        channel: { id: data.channelId, name: "" },
        replyTo: data.parentId ?? null,
        readBy: [],
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      };

      queryClient.setQueryData(["messages", channelId], (old: Message[] | undefined) => {
        if (!old) return [formatData];
        if (old.some((existingMessage) => existingMessage.id === formatData.id)) return old;
        return [formatData, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
    [channelId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(["messages", channelId], (old: Message[] | undefined) => {
        if (!old) return old;
        return old.map((existingMessage) =>
          existingMessage.id === data.id
            ? {
                ...existingMessage,
                content: data.content,
                isEdited: data.isEdited,
                editedAt: data.editedAt,
                createdAt: data.createdAt,
              }
            : existingMessage,
        );
      });
    },
    [channelId, queryClient],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; channelId: string }) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(["messages", channelId], (old: Message[] | undefined) => {
        if (!old) return old;
        return old.filter((existingMessage) => existingMessage.id !== data.messageId);
      });
    },
    [channelId, queryClient],
  );

  useSocketEvents({
    "message.sent": handleMessageSent,
    "message.edited": handleMessageEdited,
    "message.deleted": handleMessageDeleted,
  });

  // Auto-join room when channelId changes OR when socket reconnects
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !channelId) return;

    const joinRoom = () => {
      socket.emit("channel.join", { channelId });
    };

    // Join on mount / channel change
    joinRoom();

    // Re-join on every socket (re)connection — rooms don't survive reconnect
    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
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
