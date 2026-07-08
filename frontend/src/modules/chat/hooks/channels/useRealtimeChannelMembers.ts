"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, onSocketReady } from "@/modules/chat/lib/socket";

interface MemberJoinedPayload {
  channelId: string;
}

export function useRealtimeChannelMembers(channelId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;

    const handler = (data: MemberJoinedPayload) => {
      if (data.channelId === channelId) {
        queryClient.invalidateQueries({ queryKey: ["members", channelId] });
        queryClient.invalidateQueries({ queryKey: ["channels"] });
      }
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