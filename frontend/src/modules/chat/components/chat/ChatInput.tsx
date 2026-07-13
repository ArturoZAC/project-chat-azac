"use client";

import { useState, useRef, useEffect } from "react";
import { IconArrowUp, IconPaperclip, IconX } from "@tabler/icons-react";
import { sendMessageSchema, editMessageSchema } from "@/modules/chat/schemas/chat.schema";
import type { Message } from "@/modules/chat/interfaces/message.interface";

interface ChatInputProps {
  onSend: (content: string) => void;
  onSaveEdit?: (messageId: string, content: string) => void;
  onCancelEdit?: () => void;
  editingMessage?: Message | null;
  isLoading?: boolean;
}

export function ChatInput({
  onSend,
  onSaveEdit,
  onCancelEdit,
  editingMessage = null,
  isLoading = false,
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!editingMessage;

  // Prepopulate content when entering edit mode
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      // Focus and place cursor at end
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 0);
    }
  }, [editingMessage?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (isEditing && editingMessage && onSaveEdit) {
      const result = editMessageSchema.safeParse({ content: content.trim() });
      if (!result.success) return;
      onSaveEdit(editingMessage.id, result.data.content);
      setContent("");
      return;
    }

    const result = sendMessageSchema.safeParse({ content: content.trim() });
    if (!result.success) return;

    onSend(result.data.content);
    setContent("");
  };

  const handleCancel = () => {
    setContent("");
    onCancelEdit?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && isEditing) {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* Edit mode banner */}
      {isEditing && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 bg-primary-light/30 rounded-t-lg text-xs text-primary font-medium">
          <span>Editando mensaje</span>
          <button
            type="button"
            onClick={handleCancel}
            className="p-0.5 rounded hover:bg-primary-light/50 transition-colors"
          >
            <IconX size={14} />
          </button>
        </div>
      )}

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
          placeholder={isEditing ? "Edita tu mensaje..." : "Escribe un mensaje..."}
          rows={1}
          className="flex-1 text-sm resize-none outline-none border-none bg-transparent py-1.5 max-h-[120px] placeholder:text-gray-mid"
        />

        {/* Send / Save button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || isLoading}
          className="p-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isEditing ? (
            <span className="text-xs font-semibold px-1">Guardar</span>
          ) : (
            <IconArrowUp size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
