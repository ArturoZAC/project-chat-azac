# Admin Suite — Design Spec

> **Status:** Planned
> **Date:** 2026-06-25
> **Author:** AI Agent
> **Branch:** `admin`

## Problem

1. No admin panel exists — no way to manage users or channels from the UI
2. No user overview — admins can't see who's registered, their roles, or status
3. No channel overview — admins can't see all channels with type, members, creator info
4. No user detail view — admins can't inspect a user's activity, participation, or security

## Architecture

### Route Structure

```
app/(chat)/          ← Layout: Sidebar + TopBar + children
├── admin/
│   ├── users/
│   │   ├── page.tsx              ← User List (Server Component)
│   │   └── [userId]/
│   │       └── page.tsx          ← User Detail (Server Component)
│   └── channels/
│       └── page.tsx              ← Channel List (Server Component)
├── channels/                     ← existing
├── dm/                           ← existing
├── messages/                     ← existing
├── profile/                      ← existing
├── settings/                     ← existing
├── layout.tsx                    ← existing, shared
└── page.tsx                      ← existing
```

### Module Structure

```
modules/admin/
├── components/
│   ├── users/
│   │   ├── MetricCards.tsx         ← 3 stat cards
│   │   ├── UsersToolbar.tsx        ← Search + role filter
│   │   └── UsersTable.tsx          ← TanStack Table
│   ├── user-detail/
│   │   ├── UserProfileCard.tsx     ← Avatar + data + actions
│   │   ├── UserChannelsList.tsx    ← Channel participation
│   │   ├── ActivityChart.tsx       ← Recharts BarChart
│   │   └── SecuritySummary.tsx     ← 2FA + verification
│   └── channels/
│       ├── AdminChannelsToolbar.tsx ← Pills + search + create
│       ├── AdminChannelsTable.tsx   ← TanStack Table
│       └── CreateChannelModal.tsx   ← Modal form overlay
├── interfaces/
│   └── admin.interface.ts          ← Extended types
└── lib/
    └── mock-admin-data.ts          ← 15-20 mock users + stats
```

### Sidebar Evolution

```
BEFORE:                         AFTER:
┌──────────────────────┐        ┌──────────────────────┐
│ 4Z4C                 │        │ 4Z4C                 │
│                      │        │                      │
│ 💬 Mensajes         │        │ 💬 Mensajes          │
│ #  Canales          │        │ #  Canales           │
│ 👤 Perfil           │        │ 👤 Perfil            │
│ ⚙️ Configuración    │        │ ⚙️ Configuración     │
│                      │        │                      │
│ Mis canales          │        │ Mis canales          │
│ # General            │        │ # General            │
│ # Diseño             │        │ # Diseño             │
│ # Random             │        │ # Random             │
│                      │        │ ─────────────────── │
│ [avatar] Artur [≡]   │        │ ADMINISTRACIÓN       │
└──────────────────────┘        │ 👥 Usuarios          │
                                │ #  Canales           │
                                │                      │
                                │ [avatar] Artur [≡]   │
                                └──────────────────────┘
```

### TopBar Breadcrumbs

| Route | Breadcrumb |
|---|---|
| `/admin/users` | Inicio > Administración > Usuarios |
| `/admin/users/:userId` | Inicio > Administración > Usuarios > `username` |
| `/admin/channels` | Inicio > Administración > Canales |

---

## Components

### 1. MetricCards (`modules/admin/components/users/MetricCards.tsx`)
- **Type:** Client Component
- **Props:** `totalUsers: number`, `adminCount: number`, `onlineCount: number`
- **Layout:** Grid 3 columns (desktop) → 1 column (mobile)
- **Card design per stat:**
  ```
  ┌──────────────────────────┐
  │ [icon box]               │
  │                          │
  │  42    Total usuarios    │
  │  h3    small-muted       │
  └──────────────────────────┘
  ```
- **Cards:**
  | Card | Icon | Box | Number |
  |---|---|---|---|
  | Total usuarios | IconUsers | bg-primary-light | totalUsers |
  | Administradores | IconShield | bg-primary-light | adminCount |
  | En línea | IconCircleCheck | bg-green-50 | onlineCount |
- **Styling:** White bg, rounded-2xl, border border-gray-light, p-5, shadow-sm

### 2. UsersToolbar (`modules/admin/components/users/UsersToolbar.tsx`)
- **Type:** Client Component
- **Props:** `search: string`, `onSearchChange: (v: string) => void`, `roleFilter: string`, `onRoleFilterChange: (v: string) => void`
- **Layout:** Flex row, space-between
- **Left:** Search input
  - IconSearch left inset (text-silver-dark)
  - Border gray-light, rounded-lg, px-3 py-2
  - Placeholder: "Buscar usuarios..."
- **Right:** Role filter dropdown
  - Select native element or custom dropdown
  - Options: "Todos los roles", "Admin", "Usuario"
  - Styled with border-gray-light, rounded-lg, px-3 py-2

### 3. UsersTable (`modules/admin/components/users/UsersTable.tsx`)
- **Type:** Client Component
- **Props:** `users: AdminUser[]`, `search: string`, `roleFilter: string`
- **Library:** `@tanstack/react-table` v8 — `useReactTable`
- **Features:**
  - `getCoreRowModel` — base rendering
  - `getSortedRowModel` — column sorting (click header to sort)
  - `getFilteredRowModel` — global search filter + column filter on role
  - `getPaginationRowModel` — client-side pagination, 10 rows per page
- **Columns:**

  | Column | Accessor | Type | Sortable | Cell |
  |---|---|---|---|---|
  | Usuario | `username` | accessor | ✅ | Avatar circle (initials, primary bg) + username |
  | Email | `email` | accessor | ✅ | Plain text |
  | Rol | `role` | accessor | ✅ | Badge: ADMIN (primary-bg), USER (gray-bg) |
  | Estado | `isOnline` | accessor | ❌ | Green dot (online) / gray dot (offline) |
  | Verificado | `isEmailVerified` | accessor | ❌ | IconCircleCheck (green) or IconX (gray) |
  | Registro | `createdAt` | accessor | ✅ | Formatted date (short) |
  | Acciones | — | display | ❌ | 3-dots button (IconDotsVertical) |

- **Row click:** `onClick` navigates to `/admin/users/[row.id]`
- **Pagination controls:**
  - Previous/Next buttons
  - "Página 1 de 3"
  - Styled small-muted, gap-2, hover effects
- **Empty state:** "No se encontraron usuarios" centered with IconMoodSad

### 4. UserProfileCard (`modules/admin/components/user-detail/UserProfileCard.tsx`)
- **Type:** Client Component
- **Props:** `user: AdminUser`
- **Layout:**
  ```
  ┌──────────────────────────────────────────┐
  │  ┌────────┐                              │
  │  │  LU    │  username (h4)              │
  │  │  80px  │  email (p-muted)            │
  │  │  ring  │  [ADMIN] badge              │
  │  └────────┘  ID: u1 (small-muted)       │
  │                                          │
  │  Fecha de registro     Último acceso     │
  │  01 ene 2026           20 jun 2026       │
  │  Estado                                   │
  │  ● En línea                              │
  │                                          │
  │  [Editar] [Suspender] [Eliminar]        │
  └──────────────────────────────────────────┘
  ```
- **Actions:** All mock (console.log + toast)
- **Styling:** White bg, rounded-2xl, border, shadow-sm, p-6

### 5. UserChannelsList (`modules/admin/components/user-detail/UserChannelsList.tsx`)
- **Type:** Client Component
- **Props:** `channels: Array<{ id: string; name: string; role: string }>`
- **Section title:** "Canales donde participa" (h5, font-semibold)
- **Empty state:** "No participa en ningún canal."
- **List items:**
  - IconHash box (bg-silver-light, rounded-lg)
  - Channel name
  - Role badge: OWNER (primary-light/primary), MEMBER (gray-light/gray-dark)
- **Styling:** White bg, rounded-2xl, border, shadow-sm, p-6

### 6. ActivityChart (`modules/admin/components/user-detail/ActivityChart.tsx`)
- **Type:** Client Component
- **Props:** `data: DayActivity[]`
- **Library:** Recharts (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
- **Section title:** "Actividad" (h5, font-semibold)
- **Chart config:**
  - `ResponsiveContainer` width="100%" height={200}
  - `BarChart` data={data}
  - `XAxis` dataKey="day" — labels: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
  - `YAxis` — tick count 5, allow decimals=false
  - `Tooltip` — shows fullDay + message count
  - `Bar` dataKey="messages" fill="var(--color-primary)" radius={[4, 4, 0, 0]}
  - No legend needed
- **Empty state:** "No hay datos de actividad disponibles."
- **Styling:** White bg, rounded-2xl, border, shadow-sm, p-6

### 7. SecuritySummary (`modules/admin/components/user-detail/SecuritySummary.tsx`)
- **Type:** Client Component
- **Props:** `user: AdminUser`
- **Section title:** "Seguridad" (h5, font-semibold)
- **Rows:**
  - Verificación de email → IconCircleCheck (green, verified) / IconX (gray, unverified)
  - Autenticación 2FA → Badge: "Activado" (green bg) / "Desactivado" (gray bg)
- **Styling:** White bg, rounded-2xl, border, shadow-sm, p-6

### 8. AdminChannelsToolbar (`modules/admin/components/channels/AdminChannelsToolbar.tsx`)
- **Type:** Client Component
- **Props:** `activeFilter: string`, `onFilterChange: (v: string) => void`, `search: string`, `onSearchChange: (v: string) => void`, `onCreateClick: () => void`
- **Layout:** Flex row, space-between, items-center, gap-4, flex-wrap
- **Left section:**
  - Pill buttons: "Todos" | "Públicos" | "Privados"
  - Active pill: bg-primary text-white
  - Inactive pill: bg-silver-light text-gray-dark hover:bg-gray-light
- **Right section:**
  - Search input (same style as UsersToolbar)
  - "+ Crear canal" button (primary bg, white text, rounded-lg, px-4 py-2)

### 9. CreateChannelModal (`modules/admin/components/channels/CreateChannelModal.tsx`)
- **Type:** Client Component
- **Props:** `isOpen: boolean`, `onClose: () => void`
- **Overlay:** Fixed inset-0, bg-black/50, z-50, flex items-center justify-center
- **Modal card:** White, rounded-2xl, shadow-xl, max-w-md w-full, p-6, mx-4
- **Header:** "Crear canal" (h4, font-semibold) + close X button (IconX)
- **Form:**
  - Nombre del canal (input, required)
  - Descripción (textarea, optional, rows=3)
  - Tipo de canal:
    - Two pill buttons: "Público" / "Privado"
    - Active: primary bg
    - State managed internally
- **Footer:**
  - Cancelar (border-gray-light, text-gray-dark, rounded-lg, px-4 py-2)
  - Crear (primary bg, white text, rounded-lg, px-4 py-2, font-semibold)
  - Both close modal on click
- **Submit behavior:**
  - console.log({ name, description, type })
  - Show toast "Canal creado exitosamente"
  - Close modal
  - Reset form
- **Close triggers:** Overlay click, Escape key, X button, Cancel
- **Animation:** Framer Motion — fade in overlay + scale up modal

### 10. AdminChannelsTable (`modules/admin/components/channels/AdminChannelsTable.tsx`)
- **Type:** Client Component
- **Props:** `channels: AdminChannel[]`
- **Library:** `@tanstack/react-table` v8 — `useReactTable`
- **Features:**
  - `getCoreRowModel`
  - `getSortedRowModel`
  - `getFilteredRowModel`
  - `getPaginationRowModel` (10 per page)
- **Columns:**

  | Column | Accessor | Type | Sortable | Cell |
  |---|---|---|---|---|
  | | | display | ❌ | IconHash in gray box |
  | Nombre | `name` | accessor | ✅ | Bold text |
  | Descripción | `description` | accessor | ❌ | Truncated, max 60 chars + "..." |
  | Tipo | `type` | accessor | ✅ | Badge: PUBLIC (blue bg), PRIVATE (orange bg) |
  | Miembros | `membersCount` | accessor | ✅ | Count number |
  | Creador | `owner.username` | accessor (nested) | ✅ | Username |
  | Creado el | `createdAt` | accessor | ✅ | Formatted date |

- **Pagination controls:** Same as UsersTable
- **Empty state:** "No se encontraron canales."

---

## Data Flow

```
mock-admin-data.ts
  ├── getAdminUsers() → AdminUser[]
  │     ├── MetricCards (total, admin, online counts)
  │     ├── UsersToolbar → UsersTable (filtered + paginated)
  │     └── UserProfileCard + UserChannelsList + ActivityChart + SecuritySummary
  │         (via findUserById)
  │
  └── getAdminChannels() → AdminChannel[]
        ├── AdminChannelsToolbar → AdminChannelsTable (filtered + paginated)
        └── CreateChannelModal (mock submit)

SidebarClient.tsx
  └── usePathname() → active state for ADMIN_NAV_ITEMS

TopBarClient.tsx
  └── useBreadcrumbs(pathname) → admin breadcrumb segments
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `frontend/package.json` | **Modify** — add recharts + react-is deps |
| `modules/admin/interfaces/admin.interface.ts` | **Create** |
| `modules/admin/lib/mock-admin-data.ts` | **Create** |
| `modules/admin/components/users/MetricCards.tsx` | **Create** |
| `modules/admin/components/users/UsersToolbar.tsx` | **Create** |
| `modules/admin/components/users/UsersTable.tsx` | **Create** |
| `modules/admin/components/user-detail/UserProfileCard.tsx` | **Create** |
| `modules/admin/components/user-detail/UserChannelsList.tsx` | **Create** |
| `modules/admin/components/user-detail/ActivityChart.tsx` | **Create** |
| `modules/admin/components/user-detail/SecuritySummary.tsx` | **Create** |
| `modules/admin/components/channels/AdminChannelsToolbar.tsx` | **Create** |
| `modules/admin/components/channels/AdminChannelsTable.tsx` | **Create** |
| `modules/admin/components/channels/CreateChannelModal.tsx` | **Create** |
| `app/(chat)/admin/users/page.tsx` | **Create** |
| `app/(chat)/admin/users/[userId]/page.tsx` | **Create** |
| `app/(chat)/admin/channels/page.tsx` | **Create** |
| `modules/chat/components/sidebar/SidebarClient.tsx` | **Modify** — add admin nav section |
| `modules/chat/components/layout/TopBarClient.tsx` | **Modify** — add admin breadcrumbs |

---

## Constraints

- All icons: Tabler Icons (`@tabler/icons-react`)
- All animations: Framer Motion (CreateChannelModal only — fade + scale)
- Typography: system classes from globals.css (no Tailwind text-*)
- Colors: theme classes only (no Tailwind text-white/black)
- TanStack Table: standard v8 API (`useReactTable`, NOT `useLegacyTable`)
- Recharts: `ResponsiveContainer` for fluid width, `BarChart` with `Bar`, `XAxis`, `YAxis`, `Tooltip`
- Mock data only — no API calls, no server actions
- All admin pages are Client Components (interactivity required)
- No loading.tsx or Suspense needed (mock data is instant)
- No Y-axis entry animations on any component

## Out of Scope

- Channel Detail view (excluded by decision)
- Real API integration
- User create/delete/suspend (mock actions only)
- Role management (change user role)
- Bulk actions (select multiple users)
- Export data (CSV/PDF)
- Activity filtering (date range picker)
- Real-time updates via WebSocket
- Permission-based route protection (no middleware)
