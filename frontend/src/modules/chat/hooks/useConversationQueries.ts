import { useQuery } from "@tanstack/react-query";
import { getConversationsAction } from "../actions/conversations/get-conversations.action";
import { getConversationMessagesAction } from "../actions/conversations/get-conversation-messages.action";
import { getUsersAction } from "@/shared/actions/get-users.action";
import type { ConversationWithDetails } from "../interfaces/conversation.interface";
import type { PaginatedMessages } from "../interfaces/conversation.interface";
import type { User } from "@/modules/auth/interfaces/user.interface";

const CONVERSATIONS_KEY = ["conversations"];
const CONVERSATION_MESSAGES_KEY = (id: string) => ["conversation-messages", id];
const USERS_KEY = ["users"];

export function useConversationQueries(conversationId?: string) {
  const getConversations = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async (): Promise<ConversationWithDetails[]> => {
      const res = await getConversationsAction();
      if (!res.success) return [];
      return res.data as ConversationWithDetails[];
    },
  });

  const getConversationMessages = useQuery({
    queryKey: CONVERSATION_MESSAGES_KEY(conversationId!),
    queryFn: async (): Promise<PaginatedMessages> => {
      const res = await getConversationMessagesAction(conversationId!);
      if (!res.success) return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      return res.data as PaginatedMessages;
    },
    enabled: !!conversationId,
  });

  const getUsers = useQuery({
    queryKey: USERS_KEY,
    queryFn: async (): Promise<User[]> => {
      const res = await getUsersAction();
      if (!res.success) return [];
      return res.data.data;
    },
  });

  // Total unread across all conversations
  const getTotalUnread = useQuery({
    queryKey: ["unread", "conversations"],
    queryFn: async (): Promise<number> => {
      const res = await getConversationsAction();
      const conversations = res.data as ConversationWithDetails[];
      return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    },
  });

  return {
    getConversations,
    getConversationMessages,
    getUsers,
    getTotalUnread,
  };
}
