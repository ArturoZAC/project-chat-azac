"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversationsAction } from "@/modules/chat/actions/conversations/get-conversations.action";
import { getMyUnreadAction } from "@/modules/chat/actions/channels/get-my-unread.action";
import type { ConversationWithDetails } from "@/modules/chat/interfaces/conversations/conversation.interface";

/**
 * Returns the total unread count across DMs + channels from the API.
 * This accounts for messages received while the user was offline.
 * Uses the same query "conversations" key so data is shared/refetched together.
 */
export function useApiUnreadTotal() {
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await getConversationsAction();
      return res.data as ConversationWithDetails[];
    },
  });

  const channelUnread = useQuery({
    queryKey: ["unread", "total-summary"],
    queryFn: async (): Promise<{ total: number; byChannel: Record<string, number> }> => {
      const result = await getMyUnreadAction();
      return result;
    },
    staleTime: 30_000,
  });

  const dmTotal =
    conversations.data?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const channelTotal = channelUnread.data?.total ?? 0;
  const total = dmTotal + channelTotal;
  const isLoading = conversations.isLoading || channelUnread.isLoading;

  return { total, isLoading };
}
