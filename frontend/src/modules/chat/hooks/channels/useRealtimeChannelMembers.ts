"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, onSocketReady } from "@/modules/chat/lib/socket";
import type { Message } from "@/modules/chat/interfaces/message.interface";

interface MemberJoinedPayload {
  channelId: string;
  userId: string;
  username: string;
}

export function useRealtimeChannelMembers(channelId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;

    const handler = (data: MemberJoinedPayload) => {
      if (data.channelId !== channelId) return;

      // Add system join message to the messages cache so it appears in real-time
      const systemMessage: Message = {
        id: `system-join-${data.userId}-${Date.now()}`,
        content: JSON.stringify({
          type: "system.join",
          userId: data.userId,
          username: data.username,
        }),
        isSystem: true,
        author: { id: data.userId, username: data.username, avatarUrl: null },
        channel: { id: data.channelId, name: "" },
        replyTo: null,
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", channelId], (old: Message[] | undefined) => {
        if (!old) return [systemMessage];

        // Dedup: check if there's already a system join message for this user
        // (either from the backend `message.sent` or a previous `channel.member.joined`)
        const alreadyExists = old.some((existingMessage) => {
          if (!existingMessage.isSystem) return false;
          try {
            const parsed = JSON.parse(existingMessage.content) as { type: string; userId?: string };
            return parsed.type === "system.join" && parsed.userId === data.userId;
          } catch {
            return false;
          }
        });
        if (alreadyExists) return old;

        return [systemMessage, ...old];
      });

      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    };

    const socket = getSocket();
    if (socket?.connected) {
      socket.on("channel.member.joined", handler);
    } else {
      onSocketReady((s) => s.on("channel.member.joined", handler));
    }

    return () => {
      const s = getSocket();
      if (s) s.off("channel.member.joined", handler);
    };
  }, [channelId, queryClient]);
}