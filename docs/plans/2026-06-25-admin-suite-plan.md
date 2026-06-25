# Admin Suite — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.
> **Branch:** `admin` (created from `main`)
> **Status:** Planned — ready for execution

**Goal:** Build 3 admin views (User List, User Detail, Channel List) with mock data, TanStack Table, and Recharts. Admin nav section in existing sidebar.

**Architecture:** Routes inside `(chat)/admin/` share the chat layout (sidebar + topbar). Components in new `modules/admin/` module. Mock data in `mock-admin-data.ts` (15-20 users). Recharts for activity bar chart. TanStack Table for data tables.

**Tech Stack:** Next.js 16.2 (App Router), TanStack Table v8, Recharts v3, Zustand, Tabler Icons, Tailwind CSS v4, Framer Motion.

## Global Constraints

- All icons from `@tabler/icons-react`
- All animations via Framer Motion
- Typography: system classes from globals.css only (no Tailwind `text-*`)
- Colors: theme classes only (no `text-white`/`text-black`)
- "use client" only for interactive components
- No Y-axis entry animations on any component
- Channel Detail view excluded (no backend endpoint support)
- All data is mock — API-ready structure

---

### FASE 0: Setup + Dependencies

**Files:**
- Install: `pnpm add recharts react-is` in `frontend/`
- Create: `modules/admin/interfaces/admin.interface.ts`
- Create: `modules/admin/lib/mock-admin-data.ts`

**Interfaces:**
- `admin.interface.ts`:
  - `AdminUser` extends `User` with `messageCount`, `lastActiveChannel`, `isSuspended`, `twoFactorEnabled`
  - `DayActivity` type: `{ day: string; messages: number; fullDay: string }`
  - `AdminChannel` extends `Channel` with `creator`, `memberList`
- `mock-admin-data.ts`:
  - 15-20 users with varied roles, online status, verification, registration dates
  - Channel participation per user
  - Activity stats (messages per day of week) per user
  - Enriched channels list

- [ ] **Step 0.1: Install recharts + react-is** — `cd frontend && pnpm add recharts react-is`
- [ ] **Step 0.2: Create admin.interface.ts** with AdminUser, DayActivity, AdminChannel types
- [ ] **Step 0.3: Create mock-admin-data.ts** with 15-20 users, stats, participations

---

### FASE 1: Sidebar + TopBar Integration

**Files:**
- Modify: `modules/chat/components/sidebar/SidebarClient.tsx`
- Modify: `modules/chat/components/layout/TopBarClient.tsx`

**Admin nav items in sidebar:**
- New `ADMIN_NAV_ITEMS` array below "Mis canales" section
- Divider line (`<hr />`) + section label "ADMINISTRACIÓN"
- Items: Usuarios (`IconUsers`, `/admin/users`), Canales (`IconHash`, `/admin/channels`)
- Same collapsed behavior as main nav (icons only)
- Active state via `usePathname()`

**TopBar breadcrumbs:**
- `/admin/users` → "Administración" / "Usuarios"
- `/admin/users/[userId]` → "Administración" / "Usuarios" / "[username]"
- `/admin/channels` → "Administración" / "Canales"

- [ ] **Step 1.1: Add ADMIN_NAV_ITEMS to SidebarClient.tsx** with divider and section
- [ ] **Step 1.2: Update useBreadcrumbs in TopBarClient.tsx** for admin routes

---

### FASE 2: User List (`/admin/users`)

**Files:**
- Create: `app/(chat)/admin/users/page.tsx`
- Create: `modules/admin/components/users/MetricCards.tsx`
- Create: `modules/admin/components/users/UsersToolbar.tsx`
- Create: `modules/admin/components/users/UsersTable.tsx`

**Components:**
- `MetricCards.tsx` (Client):
  - 3 stat cards: Total usuarios, Administradores, En línea
  - Each card: icon box (primary-light bg), number (h3), label (small-muted)
  - Grid: 3 columns on desktop, 1 on mobile
- `UsersToolbar.tsx` (Client):
  - Search input with `IconSearch` (left icon, border-gray-light)
  - Role filter dropdown: "Todos los roles", "Admin", "Usuario"
  - State lifted to parent via props
- `UsersTable.tsx` (Client) — TanStack Table v8:
  - Columns: Avatar/Username, Email, Rol (badge), Status (dot), Verificado (checkmark), Registro (formatted date), Acciones (3-dots menu)
  - Sorting enabled on: Username, Email, Rol, Registro
  - Column filtering on: Rol
  - Pagination: 10 rows per page, page controls at bottom
  - Row click → navigate to `/admin/users/[userId]`
- `admin/users/page.tsx` (Server):
  - Imports mock data
  - Renders title "Usuarios" (h2) + subtitle
  - Wraps MetricCards + UsersToolbar + UsersTable

- [ ] **Step 2.1: Create MetricCards.tsx**
- [ ] **Step 2.2: Create UsersToolbar.tsx**
- [ ] **Step 2.3: Create UsersTable.tsx** with TanStack Table
- [ ] **Step 2.4: Create admin/users/page.tsx**

---

### FASE 3: User Detail (`/admin/users/[userId]`)

**Files:**
- Create: `app/(chat)/admin/users/[userId]/page.tsx`
- Create: `modules/admin/components/user-detail/UserProfileCard.tsx`
- Create: `modules/admin/components/user-detail/UserChannelsList.tsx`
- Create: `modules/admin/components/user-detail/ActivityChart.tsx`
- Create: `modules/admin/components/user-detail/SecuritySummary.tsx`

**Components:**
- `UserProfileCard.tsx` (Client):
  - Large avatar with initials (w-16 h-16, ring-4 primary-light)
  - Username (h4), email (p-muted)
  - Role badge (primary-light bg, span-primary)
  - ID tag: "ID: u1" (small-muted)
  - Metadata grid: Fecha de registro, Último acceso, Estado (online/offline)
  - Acciones: "Editar", "Suspender", "Eliminar" (mock buttons)
- `UserChannelsList.tsx` (Client):
  - Section title "Canales donde participa" (h5)
  - List of channels with # icon, name, role badge (OWNER/MEMBER)
  - Click → navigate to channel (but channel detail is excluded — just visual)
- `ActivityChart.tsx` (Client) — Recharts:
  - Section title "Actividad" (h5)
  - `BarChart` with `ResponsiveContainer`
  - XAxis: day names (Lun–Dom), YAxis: message count
  - `Tooltip` with day + count
  - Bars with fill primary color
  - Data from mock stats per user
- `SecuritySummary.tsx` (Client):
  - Section title "Seguridad" (h5)
  - Two rows: Verificación de email (IconCircleCheck green if verified), Autenticación 2FA (enabled/disabled badge)
- `admin/users/[userId]/page.tsx` (Server):
  - Finds user by ID from params
  - 404 state: "Usuario no encontrado" with back button to `/admin/users`
  - Renders UserProfileCard + UserChannelsList + ActivityChart + SecuritySummary

- [ ] **Step 3.1: Create UserProfileCard.tsx**
- [ ] **Step 3.2: Create UserChannelsList.tsx**
- [ ] **Step 3.3: Create ActivityChart.tsx** with Recharts BarChart
- [ ] **Step 3.4: Create SecuritySummary.tsx**
- [ ] **Step 3.5: Create admin/users/[userId]/page.tsx** with 404 state

---

### FASE 4: Channel List (`/admin/channels`)

**Files:**
- Create: `app/(chat)/admin/channels/page.tsx`
- Create: `modules/admin/components/channels/AdminChannelsToolbar.tsx`
- Create: `modules/admin/components/channels/AdminChannelsTable.tsx`
- Create: `modules/admin/components/channels/CreateChannelModal.tsx`

**Components:**
- `AdminChannelsToolbar.tsx` (Client):
  - Pill filters: "Todos", "Públicos", "Privados"
  - Search input with IconSearch
  - "+ Crear canal" button (primary) → opens CreateChannelModal
- `CreateChannelModal.tsx` (Client):
  - Modal overlay (bg-black/50 backdrop)
  - Card: white, rounded-2xl, shadow-xl, max-w-md
  - Title: "Crear canal" (h4)
  - Form fields:
    - Nombre del canal (text input, required)
    - Descripción (textarea, optional)
    - Tipo: Public/Private toggle (radio or pill buttons)
  - Actions: Cancelar (border) + Crear (primary)
  - Submit: console.log mock data + close modal + toast "Canal creado"
  - Close on overlay click + Escape key
- `AdminChannelsTable.tsx` (Client) — TanStack Table v8:
  - Columns: # (hash icon), Nombre, Descripción (truncated), Tipo (badge), Miembros (count), Creador (username), Creado el (date)
  - Sorting on: Nombre, Tipo, Miembros, Creado el
  - Pagination: 10 rows per page
  - No row click navigation (channel detail excluded)
- `admin/channels/page.tsx` (Server):
  - Title "Canales" (h2) + subtitle
  - Wraps AdminChannelsToolbar + AdminChannelsTable + CreateChannelModal

- [ ] **Step 4.1: Create AdminChannelsToolbar.tsx** with pill filters + search + create button
- [ ] **Step 4.2: Create CreateChannelModal.tsx** with form overlay
- [ ] **Step 4.3: Create AdminChannelsTable.tsx** with TanStack Table
- [ ] **Step 4.4: Create admin/channels/page.tsx**

---

### FASE 5: Build & Verify

- [ ] **Step 5.1: Build** — `cd frontend && pnpm run build` (must pass without errors)
- [ ] **Step 5.2: Lint** — `cd frontend && pnpm run lint` (must pass)

---

### Verification Checklist

1. Build compiles without errors
2. Routes available: `/admin/users`, `/admin/users/[userId]`, `/admin/channels`
3. Sidebar shows "ADMINISTRACIÓN" section with Usuarios and Canales
4. Sidebar admin nav items collapse/expand correctly
5. User List shows 3 metric cards, search filters table, role filter works
6. User Detail shows profile card, channels list, activity chart, security summary
7. 404 state shown for non-existent user (e.g. `/admin/users/fake123`)
8. Channel List shows pill filters (Todos/Públicos/Privados), search works
9. "+ Crear canal" opens modal with form, submit shows toast
10. TopBar breadcrumbs show correct admin path hierarchy
