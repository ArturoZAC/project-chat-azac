"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { IconArrowLeft, IconUserOff } from "@tabler/icons-react";
import { useConversationQueries } from "@/modules/chat/hooks/conversations/useConversationQueries";
import { useConversationMutations } from "@/modules/chat/hooks/conversations/useConversationMutations";
import { useRealtimeConversationMessages } from "@/modules/chat/hooks/conversations/useRealtimeConversationMessages";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";
import { MessageList } from "@/modules/chat/components/chat/MessageList";
import { ChatInput } from "@/modules/chat/components/chat/ChatInput";
import { useAuthStore } from "@/modules/auth/store/auth.store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface DMViewProps {
  userId: string;
}

// Mapping from raw backend message shape to the Message type used by MessageList
function mapMessage(msg: {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isEdited?: boolean;
}, currentUserId: string, otherUsername: string) {
  return {
    id: msg.id,
    content: msg.content,
    author: {
      id: msg.senderId,
      username: msg.senderId === currentUserId ? "Tú" : otherUsername,
      avatarUrl: null,
    },
    channel: { id: "", name: "" },
    replyTo: null,
    readBy: [],
    createdAt: msg.createdAt,
    updatedAt: msg.createdAt,
  };
}

export function DMView({ userId }: DMViewProps) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { isOnline } = useOnlineStatus();

  // 1st call: get conversation list (no conversationId needed yet)
  const { getConversations } = useConversationQueries();
  const { sendMessageMutation, createOrGetConversationMutation } = useConversationMutations();

  // Find the conversation with this user
  const conversations = getConversations.data ?? [];
  const dmConversation = useMemo(() => {
    return conversations.find((conv) =>
      conv.participants.some((p) => p.id === userId),
    );
  }, [conversations, userId]);

  const conversationId = dmConversation?.conversation?.id;
  const otherParticipant = dmConversation?.participants.find((p) => p.id !== currentUser?.id);
  const otherUsername = otherParticipant?.username ?? "Usuario";
  const otherUserId = otherParticipant?.id ?? userId;
  const isOtherOnline = isOnline(otherUserId);

  // Real-time DM messages
  useRealtimeConversationMessages(conversationId);

  // 2nd call: fetch messages with the REAL conversationId
  const { getConversationMessages } = useConversationQueries(conversationId);
  const { data: messagesData, isLoading: messagesLoading } = getConversationMessages;

  // Auto-create conversation if it doesn't exist
  useEffect(() => {
    if (!dmConversation && !createOrGetConversationMutation.isPending) {
      createOrGetConversationMutation.mutate(userId);
    }
  }, [dmConversation, userId, createOrGetConversationMutation]);

  const mappedMessages = useMemo(() => {
    if (!messagesData?.data) return [];
    const currentUserId = currentUser?.id ?? "";
    // API returns newest-first, but chat renders oldest-first (cascading down)
    return [...messagesData.data]
      .reverse()
      .map((message) => mapMessage(message, currentUserId, otherUsername));
  }, [messagesData, currentUser?.id, otherUsername]);

  const handleSend = async (content: string) => {
    if (!conversationId) return;
    sendMessageMutation.mutate({ conversationId, content });
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconUserOff size={28} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">Debes iniciar sesión</h6>
            <p className="p-muted text-sm max-w-xs">
              Inicia sesión para ver tus mensajes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* DM Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-light shrink-0">
        <button
          onClick={() => router.push("/messages")}
          className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors shrink-0"
          title="Volver a mensajes"
        >
          <IconArrowLeft size={18} />
        </button>
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="p-white text-xs font-semibold">{getInitials(otherUsername)}</span>
          </div>
          {isOtherOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="min-w-0">
          <h6 className="font-semibold text-sm truncate">{otherUsername}</h6>
          <p className="small-muted">{isOtherOnline ? "En línea" : "Desconectado"}</p>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={mappedMessages}
        isLoading={messagesLoading}
      />

      {/* DM Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
