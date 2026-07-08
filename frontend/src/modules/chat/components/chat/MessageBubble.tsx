"use client";

import { motion } from "framer-motion";
import type { Message } from "@/modules/chat/interfaces/message.interface";
import { getInitials } from "@/shared/helpers/get-initials";
import { linkify } from "@/shared/helpers/linkify";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 px-4 py-0.5 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOwn ? "bg-primary" : "bg-silver-dark"
          }`}
        >
          <span className="text-white text-xs font-semibold">
            {getInitials(message.author.username)}
          </span>
        </div>
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Author name (only for others) */}
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-dark mb-0.5 ml-1">
            {message.author.username}
          </span>
        )}

        <div
          className={`
            px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
            ${
              isOwn
                ? "bg-primary text-white rounded-br-md"
                : "bg-silver-light text-black rounded-bl-md"
            }
          `}
        >
          {linkify(message.content)}
        </div>

        <span className={`text-[10px] text-gray-mid mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
