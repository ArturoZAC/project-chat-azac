# Chat Views Refactor — Interface Reorganization + DM + Profile + Settings Design

> **Status:** Completed
> **Date:** 2026-06-23
> **Author:** AI Agent

## Problem

1. All TypeScript interfaces lived in `shared/interfaces/` regardless of ownership — no domain boundaries
2. Sidebar had a fixed width (260px) with no collapse support — took too much space on smaller screens
3. `/messages` only showed unread channels in groups — no way to see DMs or all conversations in one place
4. No DM chat view existed — users couldn't have 1-on-1 conversations
5. No profile or settings pages — users couldn't view/edit their info or configure preferences

## Architecture Changes

### Interface Ownership

```
BEFORE:                          AFTER:
shared/interfaces/               shared/interfaces/
  auth.interface.ts    ──→        api.interface.ts (solo sobrevive)
  api.interface.ts               modules/auth/interfaces/
  channel.interface.ts              auth.interface.ts
  message.interface.ts              user.interface.ts
  user.interface.ts               modules/chat/interfaces/
                                    channel.interface.ts
                                    message.interface.ts
```

### Layout Evolution

```
BEFORE:
┌───────────────┬─────────────────────────────┐
│  Sidebar 260px│  Page content (full height)  │
│  (fijo)       │                              │
└───────────────┴─────────────────────────────┘

AFTER (expanded):
┌───────────────┬─────────────────────────────┐
│  Sidebar      │  Chat content                │
│  260px        │  /channels, /messages,       │
│  (expanded)   │  /dm/[userId], /profile,     │
│               │  /profile/edit, /settings    │
│  [≡] toggle   │                              │
└───────────────┴─────────────────────────────┘

AFTER (collapsed):
┌──────┬──────────────────────────────────────┐
│  64px│  Chat content (more horizontal room) │
│      │                                       │
│ [≡]  │                                       │
└──────┴───────────────────────────────────────┘
```

## Components

### 1. UI Store (`shared/store/ui.store.ts`)
- **Type:** Zustand store with `persist` middleware
- **Key:** `azac-ui-store`
- **State:** `{ isCollapsed: boolean }`
- **Actions:** `toggle()`
- **Persistence:** localStorage via `zustand/middleware`

### 2. SidebarClient (`modules/chat/components/sidebar/SidebarClient.tsx`)
- **Type:** Client Component (`"use client"`)
- **Width:** `w-[260px]` expanded, `w-[64px]` collapsed
- **Animation:** `transition-all duration-300` on the container
- **Toggle:** `IconChevronLeft` (expanded) / `IconChevronRight` (collapsed) at bottom
- **Nav items:**
  | Icon | Label | Route |
  |---|---|---|
  | IconMessages | Mensajes | `/messages` |
  | IconHash | Canales | `/channels` |
  | IconUser | Perfil | `/profile` |
  | IconSettings | Configuración | `/settings` |
- **Active state:** Blue highlight on current route via `usePathname()`
- **Collapsed behavior:** Icons only, no text labels; tooltip optional

### 3. ConversationList (`modules/chat/components/messages/ConversationList.tsx`)
- **Type:** Client Component
- **Data sources:**
  - `useChannelQueries()` for channels with unread counts
  - `getDMConversations()` from mock-dm-data.ts for DM previews
- **Merging:** Combines all channels (as memberships) + all DM convos into a single array
- **Sorting:** By `lastActivity` descending (most recent first)
- **Rendering per item:**
  - Channel: `IconHash` in primary-light box + name + last message + time + unread badge
  - DM: User initials in primary circle + username + last message + time
- **Click:** `router.push()` to respective route

### 4. DMView (`modules/chat/components/dm/DMView.tsx`)
- **Type:** Client Component
- **Route:** `/dm/[userId]`
- **Props:** `userId: string` (from params)
- **Structure:**
  ```
  ┌───────────────────────────────────────────┐
  │  [Avatar] [Username] ● Online             │
  │───────────────────────────────────────────│
  │                                           │
  │  MessageList (filtered by DM)             │
  │                                           │
  │───────────────────────────────────────────│
  │  ChatInput                                │
  └───────────────────────────────────────────┘
  ```
- **Data:** Filters `mockMessages` to show only messages between `currentUserId` and the target user
- **Ownership:** Passes `isOwn` to `MessageBubble` based on `message.author.id === currentUserId`
- **Empty state:** "No hay mensajes. Envía el primer mensaje."
- **Error state:** If user not found → "Usuario no encontrado" with back button

### 5. Profile Page (`modules/chat/components/profile/ProfilePageClient.tsx`)
- **Type:** Client Component
- **Route:** `/profile`
- **Layout:** Centered card (max-w-lg), white rounded-2xl with shadow
- **Avatar:** 80px circle, primary bg, ring-4 primary-light
- **Info grid:** 2 columns on desktop, 1 on mobile
  - Fecha de ingreso (IconCalendar)
  - Último acceso (IconClock)
  - Verificación (IconCircleCheck, green)
- **Action:** "Editar perfil" button → `/profile/edit`
- **Footer:** Italic quote in muted text

### 6. Edit Profile (`modules/chat/components/profile/EditProfilePageClient.tsx`)
- **Type:** Client Component
- **Route:** `/profile/edit`
- **Back:** Arrow-left button at top
- **Avatar:** Preview with camera overlay button (positioned -bottom-1 -right-1)
- **Form fields:**
  - Username (text input, controlled)
  - Avatar URL (text input, controlled, placeholder)
- **Actions:** Cancelar (border/gray) / Guardar cambios (primary, with scale effect)

### 7. Settings Page (`modules/chat/components/settings/SettingsPageClient.tsx`)
- **Type:** Client Component
- **Route:** `/settings`
- **Sections (white cards):**
  | Section | Items |
  |---|---|
  | Cuenta | Email (with Cambiar button), Password (with Cambiar button), Verification status |
  | Notificaciones | Messages toggle (iOS switch), Sounds toggle |
  | Sesión | Cerrar sesión button (error border, hover fill) |
- **Toggle component:** Custom iOS-style switch (w-11 h-6 rounded-full, knob w-5 h-5)
  - ON: bg-primary, knob translate-x-5
  - OFF: bg-gray-light, knob translate-x-0

## Data Flow

1. `useUIStore` (Zustand persist) controls sidebar collapse state globally
2. `ConversationList` merges channel query data + mock DM data on the client
3. `DMView` filters messages by userId pair, sharing `MessageList` + `ChatInput` with channel view
4. Profile and settings pages read from `mockUsers` (same data source as sidebar avatar)
5. All navigation uses `useRouter().push()` from `next/navigation`

## Files Created / Modified / Deleted

| File | Action | Responsibility |
|---|---|---|
| `shared/store/ui.store.ts` | **Create** | Zustand persist store for sidebar |
| `shared/interfaces/auth.interface.ts` | **Delete** | Moved to modules/auth/interfaces/ |
| `shared/interfaces/user.interface.ts` | **Delete** | Moved to modules/auth/interfaces/ |
| `shared/interfaces/channel.interface.ts` | **Delete** | Moved to modules/chat/interfaces/ |
| `shared/interfaces/message.interface.ts` | **Delete** | Moved to modules/chat/interfaces/ |
| `modules/auth/interfaces/auth.interface.ts` | **Move** | Auth module owns auth types |
| `modules/auth/interfaces/user.interface.ts` | **Move** | Auth module owns User type |
| `modules/chat/interfaces/channel.interface.ts` | **Move** | Chat module owns Channel type |
| `modules/chat/interfaces/message.interface.ts` | **Move** | Chat module owns Message type |
| `modules/chat/lib/mock-dm-data.ts` | **Create** | Mock DM conversations |
| `modules/chat/components/sidebar/Sidebar.tsx` | **Modify** | Strip fixed width, wrap SidebarClient |
| `modules/chat/components/sidebar/SidebarClient.tsx` | **Modify** | Collapse logic, toggle, nav items |
| `modules/chat/components/messages/ConversationList.tsx` | **Create** | Unified channel + DM list |
| `modules/chat/components/messages/MessagesPageClient.tsx` | **Modify** | Use ConversationList |
| `modules/chat/components/messages/UnreadList.tsx` | **Delete** | Replaced by ConversationList |
| `modules/chat/components/dm/DMView.tsx` | **Create** | DM chat view |
| `modules/chat/components/profile/ProfilePageClient.tsx` | **Create** | Profile info page |
| `modules/chat/components/profile/EditProfilePageClient.tsx` | **Create** | Edit profile form |
| `modules/chat/components/settings/SettingsPageClient.tsx` | **Create** | Settings panels |
| `app/(chat)/dm/[userId]/page.tsx` | **Create** | DM route |
| `app/(chat)/profile/page.tsx` | **Create** | Profile route |
| `app/(chat)/profile/edit/page.tsx` | **Create** | Edit profile route |
| `app/(chat)/settings/page.tsx` | **Create** | Settings route |
| `modules/chat/store/chat.store.ts` | **Modify** | Update interface import paths |
| `modules/chat/hooks/useChannelMutations.ts` | **Modify** | Update interface import paths |
| `modules/chat/hooks/useChannelQueries.ts` | **Modify** | Update interface import paths |
| `modules/chat/lib/mock-data.ts` | **Modify** | Export getInitials and currentUserId |
| `modules/auth/actions/*.ts` | **Modify** | Update interface import paths |
| `modules/auth/store/auth.store.ts` | **Modify** | Update interface import paths |
| `shared/lib/QueryProvider.tsx` | **Modify** | Update interface import paths |

## Constraints

- All icons: Tabler Icons (`@tabler/icons-react`) — `IconBadgeCheck` does NOT exist in v3, use `IconCircleCheck`
- All animations: Framer Motion (none used — Y-axis entry animations prohibited)
- Typography: system classes from globals.css (no Tailwind text-*)
- Colors: theme classes only (no Tailwind text-white/black)
- Zustand: ui.store uses `persist` middleware with localStorage key `azac-ui-store`
- Mock data: `mock-dm-data.ts` uses same `mockUsers` as `mock-data.ts` for consistency
- `MessageBubble` accepts `isOwn` prop → `DMView` passes `message.author.id === currentUserId`

## Out of Scope

- Real API integration (still mock data)
- Mark as read / read receipts
- DM creation flow (new conversation button)
- User search/filter in ConversationList
- Profile avatar upload (mock UI only)
- Email/password change (mock UI only)
- Real logout (console.log mock)
