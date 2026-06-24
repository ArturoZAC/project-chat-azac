# Chat Views Polish — Design Specification

> **Status:** Completed
> **Date:** 2026-06-23
> **Author:** AI Agent

## Problem

1. Default landing page was `/channels` instead of `/messages` (the central hub)
2. Profile, Settings, and EditProfile felt cramped (`max-w-lg` / 512px)
3. No way to navigate back to `/messages` from any chat or settings view
4. Sidebar didn't highlight "Mensajes" when inside a DM conversation
5. Missing loading states for the 3 new routes (profile, settings, DM)
6. No Suspense pattern ready for future API integration

## Changes

### 1. Default Route

| Route | Before | After |
|-------|--------|-------|
| `/` | `redirect("/channels")` | `redirect("/messages")` |

**Impact:** The app now lands on `/messages` (unified conversation list) as the central hub.

### 2. Layout Widths

| Page | Before | After |
|------|--------|-------|
| Profile | `max-w-lg` (512px) | `max-w-2xl` (672px) |
| Settings | `max-w-lg` (512px) | `max-w-2xl` (672px) |
| EditProfile | `max-w-lg` (512px) | `max-w-2xl` (672px) |

**Vertical centering:** Changed from `items-start justify-center` to `flex-col items-center` with `my-auto` on the inner container. This centers the content vertically when the viewport is tall, yet allows scroll when the content overflows.

### 3. Back Arrows

Every view now has a back arrow pointing to `/messages`:

| View | Location | Label |
|------|----------|-------|
| Channel chat | ChatHeader, left of hash icon | Tooltip "Volver a mensajes" |
| DM chat | Header, left of avatar | Tooltip "Volver a mensajes" |
| Profile | Top of page, before card | "Volver a mensajes" |
| Settings | Top of page, before title | "Volver a mensajes" |
| Edit Profile | Top of page, before form | "Volver a mensajes" |

**Pattern:** `IconArrowLeft` + text label in muted style, `hover:text-black` transition.

### 4. Sidebar Active State

**Logic change** in `SidebarClient.tsx`:

```tsx
// Old:
const activeTabId = pathname === "/messages" ? "messages" ...

// New:
const activeTabId = pathname === "/messages" || pathname.startsWith("/dm/") ? "messages" ...
```

**Impact:** When user navigates to `/dm/lucia`, the "Mensajes" nav item is highlighted with `bg-primary-light` and `text-primary`, consistent with being in a messaging context.

### 5. Loading Skeletons

Three new skeleton components + three `loading.tsx` files:

```
modules/chat/components/skeletons/
├── ProfileSkeleton.tsx    → Avatar circle, text lines, 3 info cards, button
├── SettingsSkeleton.tsx   → Title, 3 white cards with placeholder rows
└── ChannelChatSkeleton.tsx (already existed)

app/(chat)/
├── profile/loading.tsx         → ProfileSkeleton
├── settings/loading.tsx        → SettingsSkeleton
└── dm/[userId]/loading.tsx     → ChannelChatSkeleton
```

All skeletons use `animate-pulse` + `bg-gray-light` for the shimmer effect.

### 6. Suspense Boundaries (Commented Out)

The Suspense pattern is prepared in `DMView.tsx` and `ChatView.tsx` but commented out because the project currently uses synchronous mock data.

**Architecture:**

```
┌─────────────────────────────────────┐
│  ChatHeader / DMHeader  (direct) ✅ │
├─────────────────────────────────────┤
│  <Suspense fallback={<Spinner />}>  │
│    <MessageListFetcher />           │  ← suspende mientras hace fetch
│  </Suspense>                        │
├─────────────────────────────────────┤
│  ChatInput  (direct) ✅             │
└─────────────────────────────────────┘
```

**Key implementation detail:** The delay promise must be wrapped in `useMemo` to prevent infinite re-suspension. Without `useMemo`, each re-render creates a new pending promise, causing React to suspend again indefinitely.

```tsx
// ✅ Correct: promise cached
const delayPromise = useMemo(
  () => new Promise<void>((resolve) => setTimeout(resolve, 2000)),
  []
);
use(delayPromise);

// ❌ Wrong: new promise every render → infinite suspend
use(new Promise<void>((resolve) => setTimeout(resolve, 2000)));
```

**When connecting a real API**, uncomment the Suspense wrapper + MessageListFetcher and replace the `use()` delay with an actual `fetch` call (in a Server Component) or TanStack Query with `suspense: true`.

## Files

| File | Action | Responsibility |
|---|---|---|
| `app/(chat)/page.tsx` | **Modify** | Redirect to `/messages` |
| `ProfilePageClient.tsx` | **Modify** | `max-w-2xl`, Y-center, back arrow |
| `SettingsPageClient.tsx` | **Modify** | `max-w-2xl`, Y-center, back arrow (add router) |
| `EditProfilePageClient.tsx` | **Modify** | `max-w-2xl`, Y-center, back to `/messages` |
| `ChatHeader.tsx` | **Modify** | Add `onBack` prop + `IconArrowLeft` |
| `ChatView.tsx` | **Modify** | Pass `onBack`, comment Suspense pattern |
| `DMView.tsx` | **Modify** | Back arrow, comment Suspense pattern |
| `SidebarClient.tsx` | **Modify** | Active tab for `/dm/` paths |
| `skeletons/ProfileSkeleton.tsx` | **Create** | Profile loading placeholder |
| `skeletons/SettingsSkeleton.tsx` | **Create** | Settings loading placeholder |
| `profile/loading.tsx` | **Create** | Import ProfileSkeleton |
| `settings/loading.tsx` | **Create** | Import SettingsSkeleton |
| `dm/[userId]/loading.tsx` | **Create** | Import ChannelChatSkeleton |

## Known Issues

- `React.use()` with raw `new Promise()` creates infinite Suspense loop. Must use `useMemo` to cache the promise.
- Suspense pattern is commented out because mock data is synchronous. When API is connected, uncomment and replace delay with real fetch.
