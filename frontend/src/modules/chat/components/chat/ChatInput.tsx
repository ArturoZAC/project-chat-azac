"use client";

import { useState, useRef, useEffect } from "react";
import { IconArrowUp, IconPaperclip } from "@tabler/icons-react";
import { sendMessageSchema } from "@/modules/chat/schemas/chat.schema";

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSend = () => {
    const result = sendMessageSchema.safeParse({ content: content.trim() });
    if (!result.success) return;

    onSend(result.data.content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div className="flex items-end gap-2 bg-white border border-gray-light rounded-xl px-3 py-2 shadow-sm focus-within:border-primary focus-within:shadow-md transition-all">
        {/* Attachment button */}
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors shrink-0"
        >
          <IconPaperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 text-sm resize-none outline-none border-none bg-transparent py-1.5 max-h-[120px] placeholder:text-gray-mid"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || isLoading}
          className="p-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <IconArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
