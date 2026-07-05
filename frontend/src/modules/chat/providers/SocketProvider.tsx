"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { connectSocket, disconnectSocket } from "@/modules/chat/lib/socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && userId && !connectedRef.current) {
      connectedRef.current = true;
      connectSocket();
    }

    if (!isAuthenticated && connectedRef.current) {
      connectedRef.current = false;
      disconnectSocket();
    }
  }, [isAuthenticated, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectedRef.current = false;
      disconnectSocket();
    };
  }, []);

  return <>{children}</>;
}
