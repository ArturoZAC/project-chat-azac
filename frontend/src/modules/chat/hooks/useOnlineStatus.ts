"use client";

import { useState, useCallback, useEffect } from "react";
import { useSocketEvents } from "./useSocketEvents";
import { onSocketReady, getSocket } from "@/modules/chat/lib/socket";

interface OnlineUser {
  userId: string;
  username: string;
}

/**
 * Tracks which users are currently online via Socket.IO events.
 * Requests the full list on connect and stays in sync via
 * `user.online` / `user.offline` events.
 */
export function useOnlineStatus() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (users: OnlineUser[]) => {
      setOnlineUsers(new Set(users.map((user) => user.userId)));
    };

    onSocketReady((socket) => {
      socket.once("user.online.list", handler);
      // Request the current list of online users
      socket.emit("request.online.list");
    });
  }, []);

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
