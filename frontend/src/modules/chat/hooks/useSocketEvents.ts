/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
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
  // Keep handlers in a ref so registered listeners always call the latest version
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const entries = Object.entries(eventsRef.current);
    const listeners: Array<{ event: string; handler: (...args: any[]) => void }> = [];

    const register = (socket: import("socket.io-client").Socket) => {
      for (const [eventName] of entries) {
        const listener = (...args: any[]) => {
          const handler = eventsRef.current[eventName];
          if (handler) handler(...args);
        };
        socket.on(eventName, listener);
        listeners.push({ event: eventName, handler: listener });
      }
    };

    const socket = getSocket();
    if (socket?.connected) {
      register(socket);
    } else {
      onSocketReady(register);
    }

    return () => {
      for (const { event, handler } of listeners) {
        const s = getSocket();
        if (s) s.off(event, handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}