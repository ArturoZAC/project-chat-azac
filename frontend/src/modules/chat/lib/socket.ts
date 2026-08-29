"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Callbacks to run once the socket connects (used to avoid race conditions with React effects) */
type SocketReadyCallback = (socket: Socket) => void;
let onConnectCallbacks: SocketReadyCallback[] = [];
const hasConnectedOnce = false;

/**
 * Register a callback that runs as soon as the socket connects.
 * If already connected, requests the data via a custom event instead
 * of relying on an already-missed server push.
 */
export function onSocketReady(callback: SocketReadyCallback): void {
  if (socket?.connected) {
    // Socket already connected — the initial `user.online.list` was already
    // received (and missed). We can't run the callback here because
    // we don't have the data anymore. Instead, rely on the fact that
    // the component will also handle `user.online` events and optionally
    // request a fresh list.
    callback(socket);
  } else {
    onConnectCallbacks.push(callback);
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";
  const origin = new URL(apiUrl).origin;

  socket = io(origin, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
    // Fire all pending callbacks
    const callbacks = onConnectCallbacks;
    onConnectCallbacks = [];
    callbacks.forEach((callback) => callback(socket!));
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
