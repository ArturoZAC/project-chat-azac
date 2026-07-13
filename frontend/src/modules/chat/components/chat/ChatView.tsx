"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconMessageOff, IconTrash, IconX } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";
import { useRealtimeChannelMessages } from "@/modules/chat/hooks/channels/useRealtimeChannelMessages";
import { useRealtimeChannelMembers } from "@/modules/chat/hooks/channels/useRealtimeChannelMembers";
import { useChannelMutations } from "@/modules/chat/hooks/channels/useChannelMutations";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getSocket } from "@/modules/chat/lib/socket";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { MembersPanel } from "@/modules/chat/components/members/MembersPanel";
import { InviteLinkModal } from "@/modules/chat/components/members/InviteLinkModal";
import { useInvitationMutations } from "@/modules/chat/hooks/invitations/useInvitationMutations";
import { ChannelChatSkeleton } from "@/modules/chat/components/skeletons/ChannelChatSkeleton";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import type { Message } from "@/modules/chat/interfaces/message.interface";

interface ChatViewProps {
  channelId: string;
}

export function ChatView({ channelId }: ChatViewProps) {
  const router = useRouter();
  const { getChannel, getMessages, getMembers } = useChannelQueries(channelId);
  const { isMembersPanelOpen, toggleMembersPanel, setMembersPanelOpen } = useChatStore();
  useRealtimeChannelMessages(channelId);
  useRealtimeChannelMembers(channelId);

  // Force fresh messages fetch every time we enter a channel (safety net for stale cache)
  const queryClient = useQueryClient();
  useEffect(() => {
    if (channelId) {
      queryClient.invalidateQueries({
        queryKey: ["messages", channelId],
      });
    }
  }, [channelId, queryClient]);

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Message | null>(null);
  const { createInvitationMutation } = useInvitationMutations();
  const { markReadMutation, deleteMessageMutation, editMessageMutation } = useChannelMutations();
  const currentUser = useAuthStore((s) => s.user);

  // Prevent hydration mismatch: server always renders skeleton (no query data),
  // client must match until hydration is complete
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Mark channel as read when opening (one-time per channel)
  const markedReadRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (channelId && !markedReadRef.current.has(channelId)) {
      markedReadRef.current.add(channelId);
      markReadMutation.mutate(channelId);
      // Clear any pending notifications for this channel
      useNotificationStore.getState().removeNotificationsForChannel(channelId);
    }
  }, [channelId]);

  // Track this channel as the active view (to suppress notifications for it)
  useEffect(() => {
    if (channelId) {
      useChatStore.getState().setActiveChannelId(channelId);
    }
    return () => {
      useChatStore.getState().setActiveChannelId(null);
    };
  }, [channelId]);

  const channel = getChannel.data;
  const isChannelOwner = channel?.owner.id === currentUser?.id;
  // API returns newest-first, but chat renders oldest-first (cascading down)
  const messages = useMemo(() => {
    const raw = getMessages.data ?? [];
    return [...raw].reverse();
  }, [getMessages.data]);
  const members = getMembers.data ?? [];
  const isChannelLoading = getChannel.isPending;
  const isMessagesLoading = getMessages.isPending;

  const handleGenerateInvite = () => {
    setInviteModalOpen(true);
    createInvitationMutation.mutate(channelId);
  };

  const handleSend = (content: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("message.send", { channelId, content });
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
  };

  const handleSaveEdit = (messageId: string, content: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("message.edit", { channelId, messageId, content });
    } else {
      // Fallback to REST API if socket not available
      editMessageMutation.mutate({ channelId, messageId, content });
    }
    setEditingMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleDeleteMessage = (message: Message) => {
    setDeleteConfirm(message);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("message.delete", { channelId, messageId: deleteConfirm.id });
    }
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Hydration guard: server and initial client render must match
  if (!hydrated || isChannelLoading) {
    return <ChannelChatSkeleton />;
  }

  // Channel not found
  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconMessageOff size={28} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">Canal no encontrado</h6>
            <p className="p-muted text-sm max-w-xs">
              El canal que buscas no existe o no tienes acceso a él.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          channel={channel}
          membersCount={members.length}
          onToggleMembers={toggleMembersPanel}
          onBack={() => router.push("/messages")}
        />
        {/* Messages — cuando conectes API real, envolver en Suspense:
            <Suspense fallback={<MessagesSpinner />}>
              <MessageListFetcher channelId={channelId} />
            </Suspense>
        */}
        <MessageList
          messages={messages}
          isLoading={isMessagesLoading}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
        />
        <ChatInput
          onSend={handleSend}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          editingMessage={editingMessage}
        />
      </div>

      {/* Members panel */}
      <MembersPanel
        isOpen={isMembersPanelOpen}
        members={members}
        onClose={() => setMembersPanelOpen(false)}
        onGenerateInvite={isChannelOwner ? handleGenerateInvite : undefined}
      />

      {/* Invite link modal */}
      <InviteLinkModal
        isOpen={isInviteModalOpen}
        inviteUrl={createInvitationMutation.data?.url ?? null}
        isGenerating={createInvitationMutation.isPending}
        onClose={() => setInviteModalOpen(false)}
        onGenerate={() => createInvitationMutation.mutate(channelId)}
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
