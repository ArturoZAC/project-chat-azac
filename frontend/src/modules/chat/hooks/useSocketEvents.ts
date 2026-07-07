/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { getSocket, onSocketReady } from "@/modules/chat/lib/socket";

/**
 * Subscribe to a single socket event. Cleans up on unmount.
 */
export function useSocketEvent(event: string, handler: (...args: any[]) => void) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}

/**
 * Subscribe to multiple socket events. Keys are event names, values are handlers.
 * Cleans up all subscriptions on unmount.
 *
 * Uses `onSocketReady` to avoid race conditions where the component
 * mounts before the socket connection is established.
 */
export function useSocketEvents(events: Record<string, (...args: any[]) => void>) {
  useEffect(() => {
    const entries = Object.entries(events);
    let cleanup: (() => void) | null = null;

    const register = (socket: import("socket.io-client").Socket) => {
      for (const [event, handler] of entries) {
        socket.on(event, handler);
      }
      cleanup = () => {
        for (const [event, handler] of entries) {
          socket.off(event, handler);
        }
      };
    };

    const socket = getSocket();
    if (socket?.connected) {
      register(socket);
    } else {
      onSocketReady(register);
    }

    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
