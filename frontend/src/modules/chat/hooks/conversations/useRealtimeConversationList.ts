"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getSocket, onSocketReady } from "@/modules/chat/lib/socket";

export function useRealtimeConversationList() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    };

    const socket = getSocket();
    if (socket?.connected) {
      socket.on("conversation.updated", handler);
    } else {
      onSocketReady((s) => s.on("conversation.updated", handler));
    }

    return () => {
      const s = getSocket();
      if (s) s.off("conversation.updated", handler);
    };
  }, [user?.id, queryClient]);
}