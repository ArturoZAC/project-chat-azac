# Top Bar + Notifications Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top navigation bar inside the chat layout with breadcrumbs, notification bell, avatar, and clickable notification panel. Make `/messages` items navigate to channels.

**Architecture:** A thin Server Component (`TopBar`) reads breadcrumb context and wraps a Client Component (`TopBarClient`) for the interactive bell/avatar/panel. `NotificationPanel` is a standalone dropdown consuming mock data. `UnreadList` gets `router.push()` for navigation.

**Tech Stack:** Next.js 16.2 (App Router), TanStack React Query, Zustand, Framer Motion, Tabler Icons, Tailwind CSS v4.

## Global Constraints

- All icons from `@tabler/icons-react`
- All animations via Framer Motion
- Typography: system classes from globals.css only (no Tailwind `text-*`)
- Colors: theme classes only (no `text-white`/`text-black`)
- "use client" only for interactive components
- Breadcrumb channel names resolved via mock data lookup (ID or name)

---

### Task 1: TopBar Server Component

**Files:**
- Create: `frontend/src/modules/chat/components/layout/TopBar.tsx`
- Create: `frontend/src/modules/chat/components/layout/TopBarClient.tsx`

**Interfaces:**
- `TopBar` renders a container `div` and delegates to `TopBarClient`
- `TopBarClient` receives `breadcrumbs: { label: string; href?: string }[]` as props
- `TopBarClient` also uses `usePathname()` to determine active state

- [ ] **Step 1: Create TopBar.tsx (Server Component)**

```tsx
import { TopBarClient } from "./TopBarClient";

interface Breadcrumb {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return [{ label: "Inicio" }];

  // /channels
  if (segments[0] === "channels" && segments.length === 1) {
    return [{ label: "Explorar" }];
  }

  // /channels/:slug
  if (segments[0] === "channels" && segments.length >= 2) {
    return [
      { label: "Canales", href: "/channels" },
      { label: decodeURIComponent(segments[1]) },
    ];
  }

  // /messages
  if (segments[0] === "messages") {
    return [{ label: "Mensajes" }];
  }

  return [{ label: "Inicio" }];
}

export function TopBar() {
  // We delegate breadcrumb resolution to the client
  // because we need usePathname() which is a client hook
  return <TopBarClient />;
}
```

Wait — `usePathname` is a Client Hook but Next.js 16 should handle it in Server Components too via `headers()`... actually no, `usePathname` is definitely a Client Hook. But `headers()` is available in Server Components.

However, the breadcrumbs need the pathname. I could:
1. Make `TopBar` a Server Component and use `headers()` to get the URL, then parse breadcrumbs
2. Make `TopBarClient` do the breadcrumb resolution using `usePathname()`

Option 2 is simpler and more reliable. Let me adjust:

- [ ] **Step 1: Create TopBar.tsx (Server Component wrapper)**

```tsx
import { TopBarClient } from "./TopBarClient";

export function TopBar() {
  return (
    <div className="h-14 border-b border-gray-light flex items-center px-6 shrink-0">
      <TopBarClient />
    </div>
  );
}
```

- [ ] **Step 2: Create TopBarClient.tsx (Client Component)**

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { IconBell, IconChevronRight } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";
import { NotificationPanel } from "@/modules/chat/components/notifications/NotificationPanel";

interface Breadcrumb {
  label: string;
  href?: string;
}

function useBreadcrumbs(pathname: string): Breadcrumb[] {
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) return [{ label: "Inicio" }];

    // /channels
    if (segments[0] === "channels" && segments.length === 1) {
      return [{ label: "Explorar" }];
    }

    // /channels/:slug
    if (segments[0] === "channels" && segments.length >= 2) {
      return [
        { label: "Canales", href: "/channels" },
        { label: decodeURIComponent(segments[1]) },
      ];
    }

    // /messages
    if (segments[0] === "messages") {
      return [{ label: "Mensajes" }];
    }

    return [{ label: "Inicio" }];
  }, [pathname]);
}

export function TopBarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = useBreadcrumbs(pathname);
  const { getTotalUnread } = useChannelQueries();
  const { isNotificationPanelOpen, setNotificationPanelOpen } = useChatStore();

  const totalUnread = getTotalUnread.data ?? 0;
  const currentUser = mockUsers.find((user) => user.id === currentUserId)!;

  return (
    <>
      {/* Breadcrumbs — left */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <IconChevronRight size={14} className="text-silver-dark shrink-0" />
            )}
            {crumb.href ? (
              <button
                onClick={() => router.push(crumb.href!)}
                className="text-sm text-silver-dark hover:text-gray-dark transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-sm font-semibold text-gray-dark truncate max-w-[200px]">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right side — bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => setNotificationPanelOpen(!isNotificationPanelOpen)}
          className="relative p-2 rounded-lg hover:bg-silver-light transition-colors"
          aria-label="Notificaciones"
        >
          <IconBell size={20} className="text-silver-dark" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="p-white text-xs font-semibold">
            {getInitials(currentUser.username)}
          </span>
        </div>
      </div>

      {/* Notification panel */}
      {isNotificationPanelOpen && (
        <NotificationPanel onClose={() => setNotificationPanelOpen(false)} />
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend; pnpm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/chat/components/layout/
git commit -m "feat: add TopBar and TopBarClient components"
```

---

### Task 2: NotificationPanel Component

**Files:**
- Create: `frontend/src/modules/chat/components/notifications/NotificationPanel.tsx`

**Interfaces:**
- Consumes: `onClose: () => void` from parent
- Uses: `useChannelQueries` for data, `mockMessages` for content, `router.push()` for navigation
- Positioned: absolute below the bell button

- [ ] **Step 1: Create NotificationPanel.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconHash, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { mockMessages } from "@/modules/chat/lib/mock-data";

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
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const { getAllChannels, getUnreadCounts } = useChannelQueries();

  const channels = getAllChannels.data ?? [];
  const unreadCounts = getUnreadCounts.data ?? {};

  // Build unread items — same data as /messages but show only last 5
  const items = channels
    .filter((ch) => (unreadCounts[ch.id] ?? 0) > 0)
    .map((ch) => {
      const msgs = mockMessages[ch.id] ?? [];
      const last = msgs[msgs.length - 1];
      return {
        channelId: ch.id,
        channelName: ch.name,
        unreadCount: unreadCounts[ch.id] ?? 0,
        lastMessage: last ? `${last.author.username}: ${last.content}` : "",
        lastTime: last?.createdAt ?? ch.updatedAt,
      };
    })
    .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
    .slice(0, 5);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
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

  const handleItemClick = (channelId: string) => {
    router.push(`/channels/${channelId}`);
    onClose();
  };

  if (items.length === 0) {
    return (
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full right-4 mt-2 w-80 bg-white border border-gray-light rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <div className="p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
            <IconCheck size={20} className="text-primary" />
          </div>
          <p className="text-sm font-medium">Todo al día</p>
          <p className="small-muted">No hay mensajes sin leer</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-4 mt-2 w-80 bg-white border border-gray-light rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-light">
        <p className="text-sm font-semibold">Notificaciones</p>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.channelId}
            onClick={() => handleItemClick(item.channelId)}
            className="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-silver-light transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
              <IconHash size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">#{item.channelName}</span>
                <span className="small-muted shrink-0">{formatTimeAgo(item.lastTime)}</span>
              </div>
              <p className="text-sm text-gray-dark truncate mt-0.5">{item.lastMessage}</p>
            </div>
            {item.unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none mt-0.5 shrink-0">
                {item.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={() => {
          router.push("/messages");
          onClose();
        }}
        className="flex items-center justify-center gap-1 w-full px-4 py-2.5 border-t border-gray-light text-sm font-medium text-primary hover:bg-primary-light/50 transition-colors"
      >
        Ver todos los mensajes
        <IconChevronRight size={16} />
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend; pnpm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/chat/components/notifications/NotificationPanel.tsx
git commit -m "feat: add NotificationPanel dropdown component"
```

---

### Task 3: Wire TopBar into Layout

**Files:**
- Modify: `frontend/src/app/(chat)/layout.tsx`

- [ ] **Step 1: Update layout.tsx**

```tsx
import { Sidebar } from "@/modules/chat/components/sidebar/Sidebar";
import { TopBar } from "@/modules/chat/components/layout/TopBar";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Add `isNotificationPanelOpen` to chat.store.ts**

The notification panel state needs to be toggled from TopBarClient. Add it to the existing store:

Modify `frontend/src/modules/chat/store/chat.store.ts`:

```ts
// Add to the state interface:
isNotificationPanelOpen: boolean;

// Add to actions:
setNotificationPanelOpen: (open: boolean) => void;

// Add initial value:
isNotificationPanelOpen: false,

// Add implementation:
setNotificationPanelOpen: (open) => set({ isNotificationPanelOpen: open }),
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend; pnpm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(chat\)/layout.tsx
git add frontend/src/modules/chat/store/chat.store.ts
git commit -m "feat: wire TopBar into chat layout, add notification panel store state"
```

---

### Task 4: Messages Page — Click Navigates to Channel

**Files:**
- Modify: `frontend/src/modules/chat/components/messages/UnreadList.tsx`

**Interfaces:**
- Change: `onClick` callback in `UnreadItemRow` from store-only to `router.push()`

- [ ] **Step 1: Update UnreadList.tsx**

Changes:
1. Import `useRouter` from `next/navigation`
2. Remove imports of `useChatStore` (no longer needed for navigation)
3. Change the `onClick` handler in `renderGroup` from:
```tsx
onClick={() => {
  setActiveChannelId(item.channelId);
  setActiveTab("channels");
}}
```
To:
```tsx
onClick={() => router.push(`/channels/${item.channelId}`)}
```

Full diff for the file:

```tsx
"use client";

import { useRouter } from "next/navigation"; // ADD
import { motion } from "framer-motion";
import { IconHash, IconCheck } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
// REMOVE: import { useChatStore } from "@/modules/chat/store/chat.store";
import { mockMessages } from "@/modules/chat/lib/mock-data";

// ... (rest of file unchanged)

export function UnreadList() {
  const router = useRouter(); // ADD
  const { getAllChannels, getUnreadCounts } = useChannelQueries();
  // REMOVE: const { setActiveTab, setActiveChannelId } = useChatStore();

  // ... (unchanged until renderGroup)

  const renderGroup = (label: string, group: UnreadItem[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-6">
        <p className="small-muted uppercase tracking-wider font-semibold mb-2 px-1">
          {label}
        </p>
        <div className="flex flex-col gap-0.5">
          {group.map((item) => (
            <UnreadItemRow key={item.channelId} item={item} onClick={() => {
              router.push(`/channels/${item.channelId}`); // CHANGED
            }} />
          ))}
        </div>
      </div>
    );
  };

  // ... (rest unchanged)
}
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend; pnpm run build`
Expected: Compiled successfully. Verify no unused import warnings for `useChatStore`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/chat/components/messages/UnreadList.tsx
git commit -m "fix: messages page items navigate to channel via router.push"
```

---

### Verification Checklist

1. `/channels` — Top Bar shows "Explorar", bell with badge, avatar
2. `/channels/ch1` — Top Bar shows "Canales / General"
3. `/channels/general` — Top Bar shows "Canales / General" (name resolution)
4. `/messages` — Top Bar shows "Mensajes"
5. Click bell → notification panel opens with unread items
6. Click notification item → navigates to channel + panel closes
7. Click outside / Escape → panel closes
8. `/messages` → click any item → navigates to `/channels/{id}`
9. Build: `pnpm run build` passes
