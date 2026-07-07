/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { getSocket } from "@/modules/chat/lib/socket";

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
 */
export function useSocketEvents(events: Record<string, (...args: any[]) => void>) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    for (const [event, handler] of Object.entries(events)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(events)) {
        socket.off(event, handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
