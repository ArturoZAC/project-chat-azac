import { getConversationsAction } from "@/modules/chat/actions/conversations/get-conversations.action";
import { getMyUnreadAction } from "@/modules/chat/actions/channels/get-my-unread.action";
import { getChannelsAction } from "@/modules/chat/actions/channels/get-channels.action";
import { useNotificationStore, type Notification } from "./notification.store";
import type { ConversationWithDetails } from "@/modules/chat/interfaces/conversations/conversation.interface";

/**
 * Fetches all unread conversations & channels from the API and pushes them
 * into the notification store as `api-*` notifications.
 *
 * Call this whenever the bell dropdown opens so the user sees accumulated
 * unread messages even if they were offline when the events arrived.
 */
export async function syncNotificationsFromApi(currentUserId: string) {
  const apiNotifications: Omit<Notification, "isRead">[] = [];

  // ── 1. DMs ──────────────────────────────────────────────
  try {
    const convRes = await getConversationsAction();
    const conversations = (convRes.data ?? []) as ConversationWithDetails[];

    for (const conv of conversations) {
      if (conv.unreadCount <= 0) continue;

      const otherParticipant = conv.participants.find(
        (p: { id: string }) => p.id !== currentUserId,
      );
      if (!otherParticipant) continue;

      const senderName = otherParticipant.username ?? "Usuario";
      const lastMsgTime =
        conv.lastMessage?.createdAt ?? conv.conversation.createdAt;

      apiNotifications.push({
        id: `api-dm-${conv.conversation.id}`,
        type: "dm",
        title: senderName,
        message:
          conv.unreadCount === 1
            ? "te envió un mensaje"
            : `te envió ${conv.unreadCount} mensajes`,
        conversationId: conv.conversation.id,
        channelName: null,
        channelId: null,
        senderId: otherParticipant.id,
        senderUsername: senderName,
        createdAt: lastMsgTime,
      });
    }
  } catch {
    // Silently fail — the store keeps whatever it had
  }

  // ── 2. Channels ─────────────────────────────────────────
  try {
    const unreadSummary = await getMyUnreadAction();
    const byChannel = unreadSummary.byChannel;
    const channelIds = Object.keys(byChannel);

    if (channelIds.length > 0) {
      const channelsRes = await getChannelsAction();
      const channels = channelsRes.data?.data ?? [];

      for (const channel of channels) {
        const unreadCount = byChannel[channel.id];
        if (!unreadCount) continue;

        const lastMsg = channel.lastMessage;
        const senderName = lastMsg?.senderUsername ?? "Alguien";

        apiNotifications.push({
          id: `api-channel-${channel.id}`,
          type: "channel",
          title: `#${channel.name}`,
          message:
            unreadCount === 1
              ? "te escribió un mensaje"
              : `te escribió ${unreadCount} mensajes`,
          channelName: channel.name,
          channelId: channel.id,
          conversationId: null,
          senderId: lastMsg?.senderId ?? "",
          senderUsername: senderName,
          createdAt: lastMsg?.createdAt ?? new Date().toISOString(),
        });
      }
    }
  } catch {
    // Silently fail
  }

  // ── 3. Push to store ────────────────────────────────────
  if (apiNotifications.length > 0) {
    useNotificationStore.getState().syncFromApi(apiNotifications);
  }
}
