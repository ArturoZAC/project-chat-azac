"use client";

import { useEffect, useRef } from "react";
import { IconMessage } from "@tabler/icons-react";
import type { Message } from "@/modules/chat/interfaces/message.interface";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

function shouldShowDateSeparator(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt);
  const curr = new Date(messages[index].createdAt);
  return (
    prev.getFullYear() !== curr.getFullYear() ||
    prev.getMonth() !== curr.getMonth() ||
    prev.getDate() !== curr.getDate()
  );
}

function SystemMessage({ content }: { content: string }) {
  let parsed: { type: string; username?: string } | null = null;
  try {
    parsed = JSON.parse(content) as { type: string; username?: string };
  } catch {
    return null;
  }

  if (parsed.type === "system.join") {
    return (
      <div className="flex items-center justify-center py-1.5">
        <div className="flex items-center gap-2 px-4 py-1 bg-primary-light/40 rounded-full">
          <span className="text-xs text-primary font-medium">
            {parsed.username ?? "Alguien"} se unió al canal
          </span>
        </div>
      </div>
    );
  }

  return null;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="p-muted">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconMessage size={26} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">Sin mensajes aún</h6>
            <p className="p-muted text-sm max-w-xs">
              Sé el primero en escribir un mensaje en este canal
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-3">
      {messages.map((msg, index) => (
        <div key={msg.id}>
          {shouldShowDateSeparator(messages, index) && <DateSeparator date={msg.createdAt} />}
          {msg.isSystem ? (
            <SystemMessage content={msg.content} />
          ) : (
            <MessageBubble message={msg} isOwn={msg.author.id === currentUserId} />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
