import { useQuery } from "@tanstack/react-query";
import {
  getConversationsApi,
  getConversationMessagesApi,
  getUsersApi,
} from "../api/conversation.api";
import type { ConversationWithDetails } from "../interfaces/conversation.interface";
import type { User } from "@/modules/auth/interfaces/user.interface";

const CONVERSATIONS_KEY = ["conversations"];
const CONVERSATION_MESSAGES_KEY = (id: string) => ["conversation-messages", id];
const USERS_KEY = ["users"];

export function useConversationQueries(conversationId?: string) {
  const getConversations = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async (): Promise<ConversationWithDetails[]> => {
      const res = await getConversationsApi();
      return res.data;
    },
  });

  const getConversationMessages = useQuery({
    queryKey: CONVERSATION_MESSAGES_KEY(conversationId!),
    queryFn: async () => {
      const res = await getConversationMessagesApi(conversationId!);
      return res.data;
    },
    enabled: !!conversationId,
  });

  const getUsers = useQuery({
    queryKey: USERS_KEY,
    queryFn: async (): Promise<User[]> => {
      const res = await getUsersApi();
      return res.data.data;
    },
  });

  // Total unread across all conversations
  const getTotalUnread = useQuery({
    queryKey: ["unread", "conversations"],
    queryFn: async (): Promise<number> => {
      const res = await getConversationsApi();
      return res.data.reduce((sum, c) => sum + c.unreadCount, 0);
    },
  });

  return {
    getConversations,
    getConversationMessages,
    getUsers,
    getTotalUnread,
  };
}
