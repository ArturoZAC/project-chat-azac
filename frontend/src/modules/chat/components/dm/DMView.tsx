"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconMessageOff, IconUserOff } from "@tabler/icons-react";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";
import {
  mockDMConversations,
  getOtherParticipant,
} from "@/modules/chat/lib/mock-dm-data";
import { MessageList } from "@/modules/chat/components/chat/MessageList";
import { ChatInput } from "@/modules/chat/components/chat/ChatInput";

interface DMViewProps {
  userId: string;
}

export function DMView({ userId }: DMViewProps) {
  const router = useRouter();
  const otherUser = mockUsers.find((u) => u.id === userId);

  const dmConversation = useMemo(() => {
    return mockDMConversations.find((dm) =>
      dm.participants.includes(currentUserId) && dm.participants.includes(userId)
    );
  }, [userId]);

  // User not found
  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconUserOff size={28} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">Usuario no encontrado</h6>
            <p className="p-muted text-sm max-w-xs">
              El usuario que buscas no existe o no está disponible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const messages = dmConversation?.messages ?? [];
  const otherInitials = getInitials(otherUser.username);

  const handleSend = (content: string) => {
    // Mock: no actual send for now — will connect to real API later
    console.log("Send DM:", { to: userId, content });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
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
            <span className="p-white text-xs font-semibold">{otherInitials}</span>
          </div>
          {otherUser.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="min-w-0">
          <h6 className="font-semibold text-sm truncate">{otherUser.username}</h6>
          <p className="small-muted">
            {otherUser.isOnline ? "En línea" : "Desconectado"}
          </p>
        </div>
      </div>

      {/* Messages — cuando conectes API real, envolver en Suspense:
          <Suspense fallback={<MessagesSpinner />}>
            <MessageListFetcher userId={userId} />
          </Suspense>
      */}
      <MessageList messages={messages} isLoading={false} />

      {/* DM Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
