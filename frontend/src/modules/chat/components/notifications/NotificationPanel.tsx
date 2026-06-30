"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconHash, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const { getAllChannels, getUnreadCounts } = useChannelQueries();

  const channels = getAllChannels.data ?? [];
  const unreadCounts = getUnreadCounts.data ?? {};

  // Build unread items — only channels with unread messages
  const items = channels
    .filter((ch) => (unreadCounts[ch.id] ?? 0) > 0)
    .map((ch) => ({
      channelId: ch.id,
      channelName: ch.name,
      unreadCount: unreadCounts[ch.id] ?? 0,
      lastMessage: "Mensajes sin leer",
      lastTime: ch.updatedAt,
    }))
    .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
    .slice(0, 5);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (channelId: string) => {
    router.push(`/channels/${channelId}`);
    onClose();
  };

  if (items.length === 0) {
    return (
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-light rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <div className="p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
            <IconCheck size={20} className="text-primary" />
          </div>
          <p className="text-sm font-medium">Todo al día</p>
          <p className="small-muted">No hay mensajes sin leer</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-light rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-light">
        <p className="text-sm font-semibold">Notificaciones</p>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.channelId}
            onClick={() => handleItemClick(item.channelId)}
            className="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-silver-light transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
              <IconHash size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">#{item.channelName}</span>
                <span className="small-muted shrink-0">{formatTimeAgo(item.lastTime)}</span>
              </div>
              <p className="text-sm text-gray-dark truncate mt-0.5">{item.lastMessage}</p>
            </div>
            {item.unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none mt-0.5 shrink-0">
                {item.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={() => {
          router.push("/messages");
          onClose();
        }}
        className="flex items-center justify-center gap-1 w-full px-4 py-2.5 border-t border-gray-light text-sm font-medium text-primary hover:bg-primary-light/50 transition-colors"
      >
        Ver todos los mensajes
        <IconChevronRight size={16} />
      </button>
    </motion.div>
  );
}
