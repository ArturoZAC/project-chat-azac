"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { getSocket, onSocketReady } from "@/modules/chat/lib/socket";

/**
 * Mantiene en sincronía las listas del chat (conversaciones DM + canales)
 * en tiempo real vía eventos de socket, sin importar la ruta actual.
 * Se monta de forma global en el layout (chat) — NO atado a una página.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const conversationHandler = (data?: { conversationId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.refetchQueries({ queryKey: ["conversations"] });

      if (data?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["conversation-messages", data.conversationId],
        });
      }

      const activeConversationId = useChatStore.getState().activeConversationId;
      if (!data?.conversationId || data.conversationId !== activeConversationId) {
        queryClient.invalidateQueries({ queryKey: ["unread"] });
      }
    };

    const channelHandler = (data?: { channelId?: string }) => {
      // Invalidate channels list + channel messages so the preview and chat refresh
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.refetchQueries({ queryKey: ["channels"] });

      if (data?.channelId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", data.channelId],
        });
      }

      const activeChannelId = useChatStore.getState().activeChannelId;
      if (!data?.channelId || data.channelId !== activeChannelId) {
        queryClient.invalidateQueries({ queryKey: ["unread"] });
      }
    };

    const socket = getSocket();
    if (socket?.connected) {
      socket.on("conversation.updated", conversationHandler);
      socket.on("channel.updated", channelHandler);
    } else {
      onSocketReady((s) => {
        s.on("conversation.updated", conversationHandler);
        s.on("channel.updated", channelHandler);
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off("conversation.updated", conversationHandler);
        s.off("channel.updated", channelHandler);
      }
    };
  }, [user?.id, queryClient]);
}