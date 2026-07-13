"use client";

import { useCallback } from "react";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import { useChatStore } from "@/modules/chat/store/chat.store";

interface NotificationPayload {
  id: string;
  type: "dm" | "channel";
  title: string;
  message: string;
  channelName?: string | null;
  conversationId?: string | null;
  channelId?: string | null;
  senderId: string;
  senderUsername: string;
  createdAt: string;
}

/**
 * Listens for `notification.new` socket events and stores them in the Zustand
 * notification store for the bell icon to display.
 */
export function useRealtimeNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleNotification = useCallback(
    (data: NotificationPayload) => {
      // Skip notifications for the conversation/channel the user is currently viewing
      const { activeConversationId, activeChannelId } = useChatStore.getState();
      if (data.type === "dm" && data.conversationId === activeConversationId) return;
      if (data.type === "channel" && data.channelId === activeChannelId) return;

      addNotification(data);
    },
    [addNotification],
  );

  useSocketEvents({
    "notification.new": handleNotification,
  });
}
