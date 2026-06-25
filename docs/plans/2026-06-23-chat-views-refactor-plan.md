# Chat Views Refactor + DM + Profile + Settings — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor chat architecture and implement 7-phases: interface cleanup, sidebar collapse, unified conversations, DM chat, profile, edit profile, and settings views.

**Architecture:** Interfaces move from `shared/interfaces/` to per-module `interfaces/`; sidebar collapse controlled by Zustand + localStorage; `/messages` unifies channels + DMs; DM chat reuses existing `MessageList`/`ChatInput`; profile/settings as standalone pages.

**Tech Stack:** Next.js 16.2 (App Router), Zustand, Tabler Icons, Tailwind CSS v4, Framer Motion.

## Global Constraints

- All icons from `@tabler/icons-react`
- All animations via Framer Motion (none used in these phases — prohibited)
- Typography: system classes from globals.css only (no Tailwind `text-*`)
- Colors: theme classes only (no `text-white`/`text-black`)
- "use client" only for interactive components
- No Y-axis entry animations on any component
- Sidebar collapse persists to localStorage (key `azac-ui-store`)

---

### FASE 1: Refactor Interfaces

**Files:**
- Move: `shared/interfaces/auth.interface.ts` → `modules/auth/interfaces/auth.interface.ts`
- Move: `shared/interfaces/user.interface.ts` → `modules/auth/interfaces/user.interface.ts`
- Move: `shared/interfaces/channel.interface.ts` → `modules/chat/interfaces/channel.interface.ts`
- Move: `shared/interfaces/message.interface.ts` → `modules/chat/interfaces/message.interface.ts`
- Keep: `shared/interfaces/api.interface.ts` (only survivor)
- Update: all 14+ import paths across the codebase
- Delete: old `shared/interfaces/*.ts` (except api.interface.ts)

**Design decisions:**
- `user.interface.ts` → `modules/auth/interfaces/` because auth owns the User concept
- `channel.interface.ts` + `message.interface.ts` → `modules/chat/interfaces/` because chat owns conversations
- `channel.interface.ts` and `message.interface.ts` import `User` from `@/modules/auth/interfaces/user.interface`

- [x] **Step 1: Move auth.interface.ts + user.interface.ts** to `modules/auth/interfaces/`
- [x] **Step 2: Move channel.interface.ts + message.interface.ts** to `modules/chat/interfaces/`
- [x] **Step 3: Update all import paths** across the entire frontend
- [x] **Step 4: Delete old files** from `shared/interfaces/` (keep only api.interface.ts)
- [x] **Step 5: Verify build** — `pnpm run build` passes

---

### FASE 2: UI Store + Sidebar Colapsable

**Files:**
- Create: `shared/store/ui.store.ts`
- Modify: `modules/chat/components/sidebar/Sidebar.tsx`
- Modify: `modules/chat/components/sidebar/SidebarClient.tsx`

**Interfaces:**
- `useUIStore`: Zustand store with `persist` middleware (key `azac-ui-store`)
  - `isCollapsed: boolean`
  - `toggle: () => void`
  - Persisted to localStorage
- `Sidebar` (Server): strips fixed width, wraps `SidebarClient`
- `SidebarClient` (Client): 
  - Dynamic width: `w-[260px]` ↔ `w-[64px]`
  - `transition-all duration-300` for smooth animation
  - Toggle button with `IconChevronLeft` / `IconChevronRight`
  - Nav items: Mensajes, Canales, Perfil (added), Configuración (added)
  - Conditional rendering: collapsed shows only icons, expanded shows icons + labels
  - Active nav state via `usePathname()`

- [x] **Step 1: Create shared/store/ui.store.ts**
- [x] **Step 2: Rewrite Sidebar.tsx** as thin wrapper
- [x] **Step 3: Rewrite SidebarClient.tsx** with collapse logic, toggle, nav items
- [x] **Step 4: Verify build**

---

### FASE 3: Mock DM Data + ConversationList Unificada

**Files:**
- Create: `modules/chat/lib/mock-dm-data.ts`
- Create: `modules/chat/components/messages/ConversationList.tsx`
- Modify: `modules/chat/components/messages/MessagesPageClient.tsx`
- Delete: `modules/chat/components/messages/UnreadList.tsx`

**Interfaces:**
- `mock-dm-data.ts`:
  - `DMConversation` type: `{ userId: string; user: User; lastMessage: Message; lastActivity: string }`
  - 3 mock DM conversations: Artur ↔ Lucía, Artur ↔ Juan, Artur ↔ Ana
  - `getDMConversations()` helper function
- `ConversationList.tsx`:
  - Merges channel memberships + DM conversations
  - Sorted by `lastActivity` descending
  - Each item shows: avatar/icon, name, last message preview, timestamp, unread badge
  - Channels show `#` icon, DMs show user initials avatar
  - Click navigates to `/channels/[channelId]` or `/dm/[userId]`
- `MessagesPageClient.tsx`:
  - Uses `ConversationList` instead of `UnreadList`
  - Subtitle: "Todas tus conversaciones activas"
  - Removes separate lists for channels/DMs

- [x] **Step 1: Create mock-dm-data.ts**
- [x] **Step 2: Create ConversationList.tsx**
- [x] **Step 3: Update MessagesPageClient.tsx**
- [x] **Step 4: Delete UnreadList.tsx**
- [x] **Step 5: Verify build**

---

### FASE 4: DM Chat View

**Files:**
- Create: `app/(chat)/dm/[userId]/page.tsx`
- Create: `modules/chat/components/dm/DMView.tsx`

**Interfaces:**
- Route: `GET /dm/[userId]` → renders `DMView`
- `DMView.tsx`:
  - Header: avatar with initials, username, online status dot
  - Body: reuses `MessageList` from `modules/chat/components/chat/MessageList.tsx`
  - Footer: reuses `ChatInput` from `modules/chat/components/chat/ChatInput.tsx`
  - Filters messages to those between `currentUser` and the target user
  - Sets `isOwn` prop on `MessageBubble` based on `message.author.id === currentUserId`
  - Handles user-not-found state with "Usuario no encontrado" message

- [x] **Step 1: Create dm/[userId]/page.tsx**
- [x] **Step 2: Create DMView.tsx**
- [x] **Step 3: Verify build**

---

### FASE 5: Profile Page

**Files:**
- Create: `app/(chat)/profile/page.tsx`
- Create: `modules/chat/components/profile/ProfilePageClient.tsx`

**Interfaces:**
- Route: `GET /profile` → renders `ProfilePageClient`
- `ProfilePageClient.tsx`:
  - Large avatar with initials (w-20 h-20, ring-4 primary-light)
  - Username (h4), email (p-muted), role badge (primary-light bg)
  - Info grid 2 columns: Fecha de ingreso, Último acceso, Verificación
  - Each info card: icon box (9x9 bg-primary-light), label (small-muted), value (text-sm font-medium)
  - "Editar perfil" button → `/profile/edit`
  - Footer motivational quote in italics

- [x] **Step 1: Create profile/page.tsx**
- [x] **Step 2: Create ProfilePageClient.tsx**
- [x] **Step 3: Verify build**

---

### FASE 6: Edit Profile Page

**Files:**
- Create: `app/(chat)/profile/edit/page.tsx`
- Create: `modules/chat/components/profile/EditProfilePageClient.tsx`

**Interfaces:**
- Route: `GET /profile/edit` → renders `EditProfilePageClient`
- `EditProfilePageClient.tsx`:
  - Back button → `/profile`
  - Avatar preview with camera overlay button
  - "Cambiar foto" link
  - Form: username (text input), avatar URL (text input, placeholder)
  - Cancel button → `/profile`
  - Save button: mock console.log + redirect → `/profile`
  - Active:scale-[0.97] on save button

- [x] **Step 1: Create profile/edit/page.tsx**
- [x] **Step 2: Create EditProfilePageClient.tsx**
- [x] **Step 3: Verify build**

---

### FASE 7: Settings Page

**Files:**
- Create: `app/(chat)/settings/page.tsx`
- Create: `modules/chat/components/settings/SettingsPageClient.tsx`

**Interfaces:**
- Route: `GET /settings` → renders `SettingsPageClient`
- `SettingsPageClient.tsx`:
  - **Account section**: email (with "Cambiar" button), password (with "Cambiar" button), verification status (green)
  - **Notifications section**: Messages toggle (iOS-style switch), Sounds toggle
  - **Session section**: Cerrar sesión button (border-error text-error, hover fills error)
  - All sections: white cards with rounded-2xl, border-gray-light, shadow-sm

- [x] **Step 1: Create settings/page.tsx**
- [x] **Step 2: Create SettingsPageClient.tsx**
- [x] **Step 3: Verify build**

---

### Verification Checklist

1. Build: `pnpm run build` compiles without errors
2. Routes available: `/`, `/channels`, `/channels/[channelId]`, `/dm/[userId]`, `/messages`, `/profile`, `/profile/edit`, `/settings`
3. Sidebar collapses/expands smoothly, state persists on refresh
4. `/messages` shows both channels and DMs unified
5. `/dm/lucia` opens DM view with messages, online status
6. `/profile` shows user info grid, edit button works
7. `/profile/edit` form saves mock data, cancel returns to profile
8. `/settings` toggles work, logout button renders correctly
