# Top Bar + Notifications + Navigation Design

> **Status:** Draft — pending user review
> **Date:** 2026-06-22
> **Author:** AI Agent

## Problem

1. No top-level navigation bar inside the chat area — user has no visual anchor for "where am I" or quick access to notifications
2. Messages page (`/messages`) shows unread threads but items are not clickable — clicking does not navigate to the channel chat
3. No notification bell or quick-access unread panel

## Layout

```
┌──────────────────────────┬──────────────────────────────────┐
│      Sidebar (260px)     │  Top Bar (56px)                  │
│  [Mensajes] [Canales]    │  [breadcrumbs]    [🔔][Avatar]  │
│  Mis canales             ├──────────────────────────────────┤
│  > General               │  Page Content (scroll)            │
│  > Diseño                │  [channels/messages content]     │
│  > Random                │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

The Top Bar lives **inside `<main>`**, not across the full viewport. It is a thin utility bar (56px) that provides breadcrumbs on the left and user controls on the right.

## Components

### 1. TopBar (`modules/chat/components/layout/TopBar.tsx`)
- **Type:** Server Component (hydration-free shell)
- Reads page context and determines breadcrumb text
- Composes `TopBarClient` for interactive parts

**Breadcrumb logic:**
| Route | Breadcrumb |
|---|---|
| `/channels` | `Explorar` |
| `/channels/:slug` | `Canales / {channel.name}` |
| `/messages` | `Mensajes` |

Channel name resolved via same helper (`resolveChannelId`) used in `useChannelQueries.ts` — lookup by ID or name.

### 2. TopBarClient (`modules/chat/components/layout/TopBarClient.tsx`)
- **Type:** Client Component (`"use client"`)
- Receives `breadcrumbs: { label: string; href?: string }[]` as props
- Renders:
  - Left: breadcrumb items (last one bold/active, others clickable)
  - Right: notification bell with unread badge + user avatar circle

### 3. NotificationPanel (`modules/chat/components/notifications/NotificationPanel.tsx`)
- **Type:** Client Component
- Dropdown anchored to the bell button
- Displays last 5 unread items (same `mockUnreadCounts` / `mockMessages` data)
- Format: `#{channelName}` → last message preview + time ago
- Clicking an item → `router.push(/channels/{channelId})` + closes panel
- "Ver todos" link → `router.push(/messages)` + closes panel
- Closes on: click outside, Escape key
- Framer Motion: scale + fade entrance

### 4. UnreadList (modify)
- Replace `setActiveChannelId + setActiveTab` with `router.push()`

## Data Flow

1. `TopBar` (Server) reads `headers()` or extracts pathname context, resolves breadcrumbs, passes them to `TopBarClient`
2. `TopBarClient` calls `useChannelQueries` for unread count and initializes notification panel state
3. `NotificationPanel` builds UnreadItem list from `mockMessages` + `mockUnreadCounts` (same data source as `/messages` page)

## Files

| File | Action | Responsibility |
|---|---|---|
| `modules/chat/components/layout/TopBar.tsx` | **Create** | Server shell, breadcrumb resolution |
| `modules/chat/components/layout/TopBarClient.tsx` | **Create** | Bell, avatar, notification panel toggle |
| `modules/chat/components/notifications/NotificationPanel.tsx` | **Create** | Dropdown with unread items |
| `app/(chat)/layout.tsx` | **Modify** | Add `<TopBar />` inside `<main>`, before `{children}` |
| `modules/chat/components/messages/UnreadList.tsx` | **Modify** | `router.push()` instead of store-only nav |

## Constraints

- All icons: Tabler Icons (`@tabler/icons-react`)
- All animations: Framer Motion
- Typography: system classes from globals.css (no Tailwind text-*)
- Colors: theme classes only (no Tailwind text-white/black)
- Zustand: `chat.store.ts` already has `activeTab`/`activeChannelId` — notification panel may read unread counts from there
- Breadcrumb names for channels resolved via mock data lookup

## Out of Scope

- Real API integration (still mock data)
- User dropdown on avatar click
- Notification panel "mark as read" action
- Real-time updates via WebSocket
