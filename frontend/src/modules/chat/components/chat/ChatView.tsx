"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IconMessageOff } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";
import { useRealtimeChannelMessages } from "@/modules/chat/hooks/channels/useRealtimeChannelMessages";
import { useRealtimeChannelMembers } from "@/modules/chat/hooks/channels/useRealtimeChannelMembers";
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

interface ChatViewProps {
  channelId: string;
}

export function ChatView({ channelId }: ChatViewProps) {
  const router = useRouter();
  const { getChannel, getMessages, getMembers } = useChannelQueries(channelId);
  const { isMembersPanelOpen, toggleMembersPanel, setMembersPanelOpen } = useChatStore();
  useRealtimeChannelMessages(channelId);
  useRealtimeChannelMembers(channelId);

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const { createInvitationMutation } = useInvitationMutations();
  const currentUser = useAuthStore((s) => s.user);

  // Prevent hydration mismatch: server always renders skeleton (no query data),
  // client must match until hydration is complete
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

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
        <MessageList messages={messages} isLoading={isMessagesLoading} />
        <ChatInput onSend={handleSend} />
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
    </div>
  );
}
