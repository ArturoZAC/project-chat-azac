"use client";

import { useState, useCallback } from "react";
import { useSocketEvents } from "./useSocketEvents";

/**
 * Tracks which users are currently online via Socket.IO `user.online`
 * and `user.offline` events.
 */
export function useOnlineStatus() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const handleUserOnline = useCallback((data: { userId: string }) => {
    setOnlineUsers((prev) => new Set(prev).add(data.userId));
  }, []);

  const handleUserOffline = useCallback((data: { userId: string }) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      next.delete(data.userId);
      return next;
    });
  }, []);

  useSocketEvents({
    "user.online": handleUserOnline,
    "user.offline": handleUserOffline,
  });

  const isOnline = useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]);

  return { onlineUsers, isOnline };
}
