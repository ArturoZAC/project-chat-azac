"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  IconMessage,
  IconHash,
  IconCheck,
} from "@tabler/icons-react";
import {
  useNotificationStore,
  type Notification,
} from "@/modules/chat/store/notification.store";

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
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const FILTERS = [
  { key: "all" as const, label: "Todos" },
  { key: "dm" as const, label: "DMs" },
  { key: "channel" as const, label: "Canales" },
];

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadNotifications = filteredNotifications.filter(
    (n) => !n.isRead,
  );

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
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

  const handleClickNotification = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.type === "dm" && notification.conversationId) {
      router.push(`/dm/${notification.senderId}`);
    } else if (
      notification.type === "channel" &&
      notification.channelId
    ) {
      router.push(`/channels/${notification.channelId}`);
    }
    onClose();
  };

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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Notificaciones</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-silver-light text-gray-dark hover:bg-gray-light"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
              <IconCheck size={20} className="text-primary" />
            </div>
            <p className="text-sm font-medium">Todo al día</p>
            <p className="small-muted">No hay notificaciones nuevas</p>
          </div>
        ) : (
          unreadNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClickNotification(notification)}
              className="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-silver-light transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  notification.type === "dm"
                    ? "bg-primary/10"
                    : "bg-primary-light"
                }`}
              >
                {notification.type === "dm" ? (
                  <IconMessage size={16} className="text-primary" />
                ) : (
                  <IconHash size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {notification.type === "dm"
                      ? notification.title
                      : `#${notification.channelName ?? notification.title}`}
                  </span>
                  <span className="small-muted shrink-0">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-dark truncate mt-0.5">
                  {notification.senderUsername} {notification.message}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
