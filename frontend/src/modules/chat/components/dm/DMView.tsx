"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconArrowLeft, IconUserOff, IconTrash } from "@tabler/icons-react";
import { useConversationQueries } from "@/modules/chat/hooks/conversations/useConversationQueries";
import { useConversationMutations } from "@/modules/chat/hooks/conversations/useConversationMutations";
import { useRealtimeConversationMessages } from "@/modules/chat/hooks/conversations/useRealtimeConversationMessages";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";
import { MessageList } from "@/modules/chat/components/chat/MessageList";
import { ChatInput } from "@/modules/chat/components/chat/ChatInput";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import { useChatStore } from "@/modules/chat/store/chat.store";
import type { Message } from "@/modules/chat/interfaces/message.interface";

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
function mapMessage(
  msg: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    editedAt?: string | null;
    isEdited?: boolean;
  },
  currentUserId: string,
  currentUsername: string,
  otherUsername: string,
): Message {
  return {
    id: msg.id,
    content: msg.content,
    author: {
      id: msg.senderId,
      username: msg.senderId === currentUserId ? currentUsername : otherUsername,
      avatarUrl: null,
    },
    channel: { id: "", name: "" },
    replyTo: null,
    readBy: [],
    createdAt: msg.createdAt,
    updatedAt: msg.editedAt ?? msg.createdAt,
    isEdited: msg.isEdited ?? false,
    editedAt: msg.editedAt ?? null,
  };
}

export function DMView({ userId }: DMViewProps) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { isOnline } = useOnlineStatus();

  // 1st call: get conversation list (no conversationId needed yet)
  const { getConversations } = useConversationQueries();
  const { sendMessageMutation, createOrGetConversationMutation, markReadMutation, editMessageMutation, deleteMessageMutation } = useConversationMutations();

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

  // Force fresh messages fetch every time we enter a DM (safety net for stale cache)
  const queryClient = useQueryClient();
  useEffect(() => {
    if (conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
    }
  }, [conversationId, queryClient]);

  // Track this conversation as the active view (to suppress notifications for it)
  useEffect(() => {
    if (conversationId) {
      useChatStore.getState().setActiveConversationId(conversationId);
    }
    return () => {
      useChatStore.getState().setActiveConversationId(null);
    };
  }, [conversationId]);

  // 2nd call: fetch messages with the REAL conversationId
  const { getConversationMessages } = useConversationQueries(conversationId);
  const { data: messagesData, isLoading: messagesLoading } = getConversationMessages;

  // Mark conversation as read when opening (one-time per conversation)
  const markedReadRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (conversationId && !markedReadRef.current.has(conversationId)) {
      markedReadRef.current.add(conversationId);
      markReadMutation.mutate(conversationId);
      // Clear any pending notifications for this conversation
      useNotificationStore.getState().removeNotificationsForConversation(conversationId);
    }
  }, [conversationId]);

  // Auto-create conversation if it doesn't exist
  useEffect(() => {
    if (!dmConversation && !createOrGetConversationMutation.isPending) {
      createOrGetConversationMutation.mutate(userId);
    }
  }, [dmConversation, userId, createOrGetConversationMutation]);

  const mappedMessages = useMemo(() => {
    if (!messagesData?.data) return [];
    const currentUserId = currentUser?.id ?? "";
    const currentUsername = currentUser?.username ?? "";
    // API returns newest-first, but chat renders oldest-first (cascading down)
    return [...messagesData.data]
      .reverse()
      .map((message) => mapMessage(message, currentUserId, currentUsername, otherUsername));
  }, [messagesData, currentUser?.id, currentUser?.username, otherUsername]);

  // ── Edit / Delete state ─────────────────────────────────
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Message | null>(null);

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
  };

  const handleSaveEdit = (messageId: string, content: string) => {
    if (!conversationId) return;
    editMessageMutation.mutate({ conversationId, messageId, content });
    setEditingMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleDeleteMessage = (message: Message) => {
    setDeleteConfirm(message);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm || !conversationId) return;
    deleteMessageMutation.mutate({ conversationId, messageId: deleteConfirm.id });
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };
  // ──────────────────────────────────────────────────────────

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
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
      />

      {/* DM Input */}
      <ChatInput
        onSend={handleSend}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        editingMessage={editingMessage}
      />

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <IconTrash size={20} className="text-red-500" />
              </div>
              <div>
                <h6 className="font-semibold">Eliminar mensaje</h6>
                <p className="p-muted text-sm">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-dark bg-silver-light hover:bg-silver-mid rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
