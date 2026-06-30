# Socket.IO Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the frontend to the backend Socket.IO gateway for real-time messaging, online status, and live UI updates.

**Architecture:** Singleton socket instance managed by a React context provider. Connection lifecycle tied to auth store (connect on login, disconnect on logout). Events handled via custom hooks that update TanStack Query caches and Zustand stores reactively.

**Tech Stack:** socket.io-client ^4.8.3, React Context, TanStack Query, Zustand

## Global Constraints

- Socket connection established only when user is authenticated (has valid JWT cookie)
- JWT cookie `token` sent automatically via `withCredentials: true`
- Socket.IO path matches backend default (`/socket.io/`)
- All real-time updates must invalidate or update TanStack Query caches to keep UI in sync
- Online/offline status updates must be reflected in the Zustand auth store and UI
- No hardcoded URLs — use `process.env.NEXT_PUBLIC_API_URL` (origin extracted for WS)
- Connection errors handled silently (reconnection logic built into socket.io-client)

---

## File Structure

```
frontend/src/
└── modules/
    └── chat/
        ├── lib/
        │   └── socket.ts              ← Singleton: creates & exports socket instance
        ├── providers/
        │   └── SocketProvider.tsx      ← Context provider: connect/disconnect lifecycle
        └── hooks/
            ├── useSocketEvents.ts      ← Generic hook to subscribe to socket events
            └── useOnlineStatus.ts      ← Hook to track online/offline users
```

## Task Decomposition

### Task 1: Socket Singleton (`lib/socket.ts`)

**Files:**

- Create: `frontend/src/modules/chat/lib/socket.ts`

**Interfaces:**

- Produces: `getSocket(): Socket | null` — returns the singleton instance (null if not connected)
- Produces: `connectSocket(): Socket` — creates or returns existing connection
- Produces: `disconnectSocket(): void` — disconnects and clears instance

- [ ] **Step 1: Create `socket.ts`**

```typescript
"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

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
```

- [ ] **Step 2: Verify no lint/type errors**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors related to `socket.ts`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/chat/lib/socket.ts
git commit -m "feat: add Socket.IO singleton (socket.ts)"
```

---

### Task 2: SocketProvider (`providers/SocketProvider.tsx`)

**Files:**

- Create: `frontend/src/modules/chat/providers/SocketProvider.tsx`
- Modify: `frontend/src/app/(chat)/layout.tsx` — wrap children with `SocketProvider`

**Interfaces:**

- Consumes: `connectSocket()`, `disconnectSocket()` from Task 1
- Consumes: `useAuthStore` — `user`, `isAuthenticated`
- Produces: `<SocketProvider>` — connects socket when authenticated, disconnects on logout/route change

- [ ] **Step 1: Create `SocketProvider.tsx`**

```typescript
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
```

- [ ] **Step 2: Wrap layout with `SocketProvider`**

Read `frontend/src/app/(chat)/layout.tsx`. Import and wrap the children:

```typescript
import { SocketProvider } from "@/modules/chat/providers/SocketProvider";

// Inside the component, wrap children:
<SocketProvider>{children}</SocketProvider>
```

**Important:** `SocketProvider` should be placed **inside** `SessionRestore` (so the session is restored first, then socket connects based on auth state).

```tsx
<SessionRestore>
  <SocketProvider>{children}</SocketProvider>
</SessionRestore>
```

- [ ] **Step 3: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/chat/providers/SocketProvider.tsx frontend/src/app/(chat)/layout.tsx
git commit -m "feat: add SocketProvider for connection lifecycle management"
```

---

### Task 3: Generic Socket Events Hook (`hooks/useSocketEvents.ts`)

**Files:**

- Create: `frontend/src/modules/chat/hooks/useSocketEvents.ts`

**Interfaces:**

- Produces: `useSocketEvent(event: string, handler: (...args: any[]) => void)` — subscribes to a socket event, auto-cleans on unmount
- Produces: `useSocketEvents(events: Record<string, (...args: any[]) => void>)` — subscribes to multiple events at once

- [ ] **Step 1: Create `useSocketEvents.ts`**

```typescript
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
```

- [ ] **Step 2: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/chat/hooks/useSocketEvents.ts
git commit -m "feat: add useSocketEvent and useSocketEvents hooks"
```

---

### Task 4: Online Status Hook (`hooks/useOnlineStatus.ts`)

**Files:**

- Create: `frontend/src/modules/chat/hooks/useOnlineStatus.ts`
- Modify: `frontend/src/modules/chat/components/sidebar/SidebarClient.tsx` — replace hardcoded `true` with real online status
- Modify: `frontend/src/modules/chat/components/messages/StartDMClient.tsx` — use real online status

**Interfaces:**

- Consumes: `useSocketEvents` from Task 3
- Produces: `useOnlineStatus(): { onlineUsers: Set<string>, isOnline(userId: string): boolean }`

- [ ] **Step 1: Create `useOnlineStatus.ts`**

```typescript
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
```

- [ ] **Step 2: Update `SidebarClient.tsx` to pass real online status**

Find the `UserShortcut` usage in `SidebarClient.tsx` (around line 185) and replace:

```tsx
isOnline={true}
```

with:

```tsx
isOnline={isOnline(other.id)}
```

Import and call the hook at the top of the component:

```typescript
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";

// Inside SidebarClient component:
const { isOnline } = useOnlineStatus();
```

- [ ] **Step 3: Update `StartDMClient.tsx` to use real online status**

Find the `u.isOnline` usage in `StartDMClient.tsx` (around lines 93, 99) and ensure the `u` object has the right field. The backend `GET /api/users` likely returns `isOnline` from the DB, but Socket.IO will keep it updated in real-time.

For now, keep `u.isOnline` as-is (from the GET /api/users response) since Socket.IO will update it when connection/disconnection happens. The real-time update via socket events will be handled by the backend emitting `user.online`/`user.offline` on every connect/disconnect.

However, we should also use the `useOnlineStatus` hook here as a fallback/override:

```typescript
// In StartDMClient:
const { isOnline: isUserOnline } = useOnlineStatus();

// When rendering:
{
  u.isOnline || isUserOnline(u.id) ? "En línea" : "Desconectado";
}
```

- [ ] **Step 4: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/chat/hooks/useOnlineStatus.ts frontend/src/modules/chat/components/sidebar/SidebarClient.tsx frontend/src/modules/chat/components/messages/StartDMClient.tsx
git commit -m "feat: add useOnlineStatus hook for real-time user presence"
```

---

### Task 5: Real-Time Channel Messages (message.sent / message.edited / message.deleted)

**Files:**

- Modify: `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts` — add `useRealtimeChannelMessages(channelId: string)`
- Create: `frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts` (separate file for real-time logic)
- Modify: `frontend/src/modules/chat/components/chat/ChatView.tsx` — integrate real-time hook

**Interfaces:**

- Consumes: `useSocketEvents` from Task 3, `getSocket` from Task 1
- Consumes: `queryClient` from TanStack Query
- Produces: `useRealtimeChannelMessages(channelId: string)` — listens for `message.sent`, `message.edited`, `message.deleted` and updates the query cache

- [ ] **Step 1: Create `useRealtimeChannelMessages.ts`**

```typescript
"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";

const CHANNEL_MESSAGES_KEY = "channel-messages";

interface MessagePayload {
  id: string;
  content: string;
  channelId: string;
  conversationId: string | null;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  parentId: string | null;
}

/**
 * Keeps channel messages in sync via Socket.IO.
 * Call this hook once when entering a channel view.
 */
export function useRealtimeChannelMessages(channelId: string | undefined) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(
        [CHANNEL_MESSAGES_KEY, channelId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return [data];
          // Avoid duplicates
          if (old.some((m) => m.id === data.id)) return old;
          return [...old, data];
        },
      );
    },
    [channelId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(
        [CHANNEL_MESSAGES_KEY, channelId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.map((m) => (m.id === data.id ? data : m));
        },
      );
    },
    [channelId, queryClient],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; channelId: string }) => {
      if (data.channelId !== channelId) return;

      queryClient.setQueryData(
        [CHANNEL_MESSAGES_KEY, channelId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.filter((m) => m.id !== data.messageId);
        },
      );
    },
    [channelId, queryClient],
  );

  useSocketEvents({
    "message.sent": handleMessageSent,
    "message.edited": handleMessageEdited,
    "message.deleted": handleMessageDeleted,
  });

  return {
    joinChannel: () => {
      const socket = getSocket();
      if (socket && channelId) {
        socket.emit("channel.join", { channelId });
      }
    },
  };
}
```

- [ ] **Step 2: Determine the query key used in `useChannelQueries`**

Read `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts` to find the exact query key for channel messages (likely `["channel-messages", channelId]`). Update the `CHANNEL_MESSAGES_KEY` constant in the hook above to match.

Search for `queryKey` patterns in `useChannelQueries.ts`:

```bash
rg "queryKey" frontend/src/modules/chat/hooks/channels/useChannelQueries.ts
```

- [ ] **Step 3: Integrate in `ChatView.tsx`**

Read `frontend/src/modules/chat/components/chat/ChatView.tsx` to find where `channelId` is available and where messages are displayed.

Add the real-time hook:

```typescript
import { useRealtimeChannelMessages } from "@/modules/chat/hooks/channels/useRealtimeChannelMessages";

// Inside ChatView component, after getting channelId:
const { joinChannel } = useRealtimeChannelMessages(channelId);

// Call joinChannel when channelId changes (e.g., in a useEffect):
useEffect(() => {
  if (channelId) {
    joinChannel();
  }
}, [channelId]);
```

- [ ] **Step 4: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts frontend/src/modules/chat/components/chat/ChatView.tsx
git commit -m "feat: add real-time channel message sync via Socket.IO"
```

---

### Task 6: Real-Time Direct Messages (conversation.message.sent / .edited / .deleted)

**Files:**

- Create: `frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts`
- Modify: `frontend/src/modules/chat/components/dm/DMView.tsx` — integrate real-time hook

**Interfaces:**

- Consumes: `useSocketEvents` from Task 3, `getSocket` from Task 1
- Consumes: `queryClient` from TanStack Query
- Produces: `useRealtimeConversationMessages(conversationId: string)` — listens for conversation message events and updates query cache

- [ ] **Step 1: Create `useRealtimeConversationMessages.ts`**

```typescript
"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { getSocket } from "@/modules/chat/lib/socket";

const CONVERSATION_MESSAGES_KEY = "conversation-messages";

interface MessagePayload {
  id: string;
  content: string;
  conversationId: string;
  channelId: string | null;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  parentId: string | null;
}

/**
 * Keeps conversation (DM) messages in sync via Socket.IO.
 */
export function useRealtimeConversationMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const handleMessageSent = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        [CONVERSATION_MESSAGES_KEY, conversationId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return [data];
          if (old.some((m) => m.id === data.id)) return old;
          return [...old, data];
        },
      );
    },
    [conversationId, queryClient],
  );

  const handleMessageEdited = useCallback(
    (data: MessagePayload) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        [CONVERSATION_MESSAGES_KEY, conversationId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.map((m) => (m.id === data.id ? data : m));
        },
      );
    },
    [conversationId, queryClient],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData(
        [CONVERSATION_MESSAGES_KEY, conversationId],
        (old: MessagePayload[] | undefined) => {
          if (!old) return old;
          return old.filter((m) => m.id !== data.messageId);
        },
      );
    },
    [conversationId, queryClient],
  );

  useSocketEvents({
    "conversation.message.sent": handleMessageSent,
    "conversation.message.edited": handleMessageEdited,
    "conversation.message.deleted": handleMessageDeleted,
  });

  return {
    joinConversation: () => {
      const socket = getSocket();
      if (socket && conversationId) {
        socket.emit("conversation.join", { conversationId });
      }
    },
  };
}
```

- [ ] **Step 2: Determine the query key for conversation messages**

Read `frontend/src/modules/chat/hooks/conversations/useConversationQueries.ts` to find the exact query key. Update `CONVERSATION_MESSAGES_KEY` to match.

- [ ] **Step 3: Integrate in `DMView.tsx`**

Read `frontend/src/modules/chat/components/dm/DMView.tsx` to find where conversation ID is available.

```typescript
import { useRealtimeConversationMessages } from "@/modules/chat/hooks/conversations/useRealtimeConversationMessages";

// Inside DMView component:
const conversationId = /* get from route params or store */;
const { joinConversation } = useRealtimeConversationMessages(conversationId);

useEffect(() => {
  if (conversationId) {
    joinConversation();
  }
}, [conversationId]);
```

- [ ] **Step 4: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts frontend/src/modules/chat/components/dm/DMView.tsx
git commit -m "feat: add real-time DM message sync via Socket.IO"
```

---

### Task 7: Invalidate Conversations List on New Message

**Files:**

- Modify: `frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts` — add invalidation of channels list
- Modify: `frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts` — add invalidation of conversations list
- Modify: `frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts` — emit `channel.join` on mount
- Modify: `frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts` — emit `conversation.join` on mount

**Rationale:** When a new message arrives, the sidebar conversation list needs to reflect the new last message and reorder. Invalidate the relevant list queries.

- [ ] **Step 1: Add query invalidation to `useRealtimeChannelMessages.ts`**

When `message.sent` is received, also invalidate the channels list:

```typescript
// Inside handleMessageSent:
queryClient.invalidateQueries({ queryKey: ["channels"] });
```

- [ ] **Step 2: Add query invalidation to `useRealtimeConversationMessages.ts`**

When `conversation.message.sent` is received, also invalidate the conversations list:

```typescript
// Inside handleMessageSent:
queryClient.invalidateQueries({ queryKey: ["conversations"] });
```

Also invalidate the unread counts:

```typescript
queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
```

- [ ] **Step 3: Auto-join room on mount**

In both real-time hooks, add a `useEffect` that emits the join event when `channelId`/`conversationId` changes:

```typescript
useEffect(() => {
  const socket = getSocket();
  if (socket && channelId) {
    socket.emit("channel.join", { channelId });
  }
}, [channelId]);
```

(This replaces the manual `joinChannel()` call from Task 5/6.)

- [ ] **Step 4: Verify build**

Run: `cd frontend; pnpm build`
Expected: Compiles without errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts
git commit -m "feat: auto-join rooms and invalidate lists on new messages"
```

---

### Task 8: Real-Time Unread Counts + Sidebar Badge Updates

**Files:**

- Modify: `frontend/src/modules/chat/hooks/useSocketEvents.ts` — no changes needed
- Modify: `frontend/src/modules/chat/hooks/channels/useRealtimeChannelMessages.ts` — invalidate unread counts
- Modify: `frontend/src/modules/chat/hooks/conversations/useRealtimeConversationMessages.ts` — invalidate unread counts
- (Query invalidation was already added in Task 7)

**Rationale:** When a new message arrives for a channel/DM the user hasn't viewed, the unread count badge in the sidebar must update. Since we're already invalidating `["unread-counts"]` and the sidebar's `useChannelQueries.getUnreadCounts` and `useConversationQueries.getTotalUnread` will re-fetch, this should work automatically.

No additional code changes needed — Task 7 already handles this via `queryClient.invalidateQueries({ queryKey: ["unread-counts"] })`.

If the backend doesn't return accurate unread counts yet (noted in progress.md as blocked), this will work once the backend endpoints are implemented.

- [ ] **Step 1: Verify sidebar refreshes on new message**

Manually test: send a message from user A in a channel, verify user B's sidebar badge updates.

- [ ] **Step 2: Commit (if changes needed)**

```bash
git commit -m "feat: auto-refresh unread counts via socket events"
```

---

### Task 9: Cleanup — Remove Mock `isOnline` Hardcodes

**Files:**

- Modify: `frontend/src/modules/admin/` — any mock admin data (postponed from scope)
- Modify: `frontend/src/modules/chat/components/sidebar/SidebarClient.tsx` — already updated in Task 4

- [ ] **Step 1: Audit for remaining hardcoded `isOnline: true`**

```bash
rg "isOnline:\s*true" frontend/src/modules/chat/ --include "*.tsx" --include "*.ts"
```

- [ ] **Step 2: Replace any remaining hardcoded values with `isOnline(userId)`**

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove hardcoded isOnline values, use Socket.IO presence"
```

---

## Verification Checklist

After all tasks are implemented, run through this checklist:

- [ ] User A logs in → Socket connects automatically
- [ ] User B logs in → User A sees User B as "En línea" in sidebar and /start
- [ ] User B disconnects → User A sees User B as "Desconectado"
- [ ] User A sends message in channel → User B receives it in real-time (no refresh needed)
- [ ] User A edits message → User B sees edit in real-time
- [ ] User A deletes message → User B sees deletion in real-time
- [ ] User A sends DM to User B → User B receives it in real-time
- [ ] User A joins a new channel → receives existing messages + new ones in real-time
- [ ] User logs out → Socket disconnects
- [ ] User logs back in → Socket reconnects
- [ ] No hydration errors on any page load
- [ ] `pnpm build` passes on both frontend and backend
