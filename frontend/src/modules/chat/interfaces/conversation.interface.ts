export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithDetails {
  conversation: Conversation;
  participants: Array<{ id: string; username: string }>;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface PaginatedMessages {
  data: MessageInConversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessageInConversation {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
}
