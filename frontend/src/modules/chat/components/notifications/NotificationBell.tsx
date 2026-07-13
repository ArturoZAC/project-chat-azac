"use client";

import { useState, useEffect } from "react";
import { IconBell } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useRealtimeNotifications } from "@/modules/chat/hooks/useRealtimeNotifications";
import { syncNotificationsFromApi } from "@/modules/chat/store/sync-notifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  // Single source of truth: the notification store (fed by socket + API sync)
  const totalUnread = useNotificationStore((s) => s.unreadCount);
  const currentUserId = useAuthStore((s) => s.userId);

  // Initialize socket listener for real-time notifications
  useRealtimeNotifications();

  // Seed API notifications on mount (so offline unread shows on the badge)
  // and whenever the dropdown opens (to catch up with latest data).
  useEffect(() => {
    if (currentUserId) {
      syncNotificationsFromApi(currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isOpen && currentUserId) {
      syncNotificationsFromApi(currentUserId);
    }
  }, [isOpen, currentUserId]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-silver-light transition-colors"
        aria-label="Notificaciones"
      >
        <IconBell size={20} className="text-silver-dark" />
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none"
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
