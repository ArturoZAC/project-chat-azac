"use client";

import { useRouter } from "next/navigation";
import { IconMessageOff } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { MembersPanel } from "@/modules/chat/components/members/MembersPanel";
import { ChannelChatSkeleton } from "@/modules/chat/components/skeletons/ChannelChatSkeleton";

interface ChatViewProps {
  channelId: string;
}

export function ChatView({ channelId }: ChatViewProps) {
  const router = useRouter();
  const { getChannel, getMessages, getMembers } = useChannelQueries(channelId);
  const { isMembersPanelOpen, toggleMembersPanel, setMembersPanelOpen } = useChatStore();

  const channel = getChannel.data;
  const messages = getMessages.data ?? [];
  const members = getMembers.data ?? [];
  const isChannelLoading = getChannel.isPending;
  const isMessagesLoading = getMessages.isPending;

  const handleSend = (content: string) => {
    // Mock: no actual send for now — will connect to real API later
    console.log("Send message:", content);
  };

  // Loading state
  if (isChannelLoading) {
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
      />
    </div>
  );
}
