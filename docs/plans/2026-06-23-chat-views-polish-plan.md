# Chat Views Polish — Back Arrows, Layout, Loading States, Suspense

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the new views (profile, settings, DM, channel chat) with back navigation, wider layout, sidebar active states, loading skeletons, and Suspense boundaries for future API integration.

**Tech Stack:** Next.js 16.2 (App Router), React 19, Zustand, Tabler Icons, Tailwind CSS v4.

---

## Global Constraints

- All icons from `@tabler/icons-react`
- Typography: system classes from globals.css only (no Tailwind `text-*`)
- Colors: theme classes only (no `text-white`/`text-black`)
- No Y-axis entry animations on any component
- Sidebar active state uses `usePathname()` for sync

---

### Task 1: Default Route → /messages

**Files:**
- Modify: `frontend/src/app/(chat)/page.tsx`

**Change:** Redirect from `/channels` to `/messages`.

```tsx
// Before:
redirect("/channels");

// After:
redirect("/messages");
```

- [x] **Step 1:** Change redirect target
- [x] **Step 2:** Verify build

---

### Task 2: Wider Layout for Profile, Settings, EditProfile

**Files:**
- Modify: `frontend/src/modules/chat/components/profile/ProfilePageClient.tsx`
- Modify: `frontend/src/modules/chat/components/settings/SettingsPageClient.tsx`
- Modify: `frontend/src/modules/chat/components/profile/EditProfilePageClient.tsx`

**Changes:**
- `max-w-lg` → `max-w-2xl` for more horizontal space
- Profile grid: `gap-4` → `gap-5`, `p-3` → `p-4`, icon boxes `w-9 h-9` → `w-10 h-10`, icons `size={16}` → `size={18}`
- Vertical centering: `items-start justify-center` → `flex-col items-center` + `my-auto` on inner container

- [x] **Step 1:** Update ProfilePageClient.tsx — width + grid spacing + Y-center
- [x] **Step 2:** Update SettingsPageClient.tsx — width + Y-center
- [x] **Step 3:** Update EditProfilePageClient.tsx — width + Y-center
- [x] **Step 4:** Verify build

---

### Task 3: Back Arrows on All Views → /messages

**Files:**
- Modify: `frontend/src/modules/chat/components/chat/ChatHeader.tsx`
- Modify: `frontend/src/modules/chat/components/chat/ChatView.tsx`
- Modify: `frontend/src/modules/chat/components/dm/DMView.tsx`
- Modify: `frontend/src/modules/chat/components/profile/ProfilePageClient.tsx`
- Modify: `frontend/src/modules/chat/components/settings/SettingsPageClient.tsx`
- Modify: `frontend/src/modules/chat/components/profile/EditProfilePageClient.tsx`

**Pattern:**
- `ChatHeader`: Add optional `onBack?: () => void` prop. When present, render `IconArrowLeft` button before the hash/lock icon.
- `ChatView`: Import `useRouter`, pass `onBack={() => router.push("/messages")}` to `ChatHeader`.
- `DMView`: Add `IconArrowLeft` button in header before avatar, `router.push("/messages")`.
- `ProfilePageClient`: Add "Volver a mensajes" button at top with `IconArrowLeft`.
- `SettingsPageClient`: Add "Volver a mensajes" button at top with `IconArrowLeft`.
- `EditProfilePageClient`: Change existing back button destination from `/profile` to `/messages`.

- [x] **Step 1:** ChatHeader.tsx — add `onBack` prop
- [x] **Step 2:** ChatView.tsx — pass `onBack` to ChatHeader
- [x] **Step 3:** DMView.tsx — add back arrow in header
- [x] **Step 4:** ProfilePageClient.tsx — add back arrow
- [x] **Step 5:** SettingsPageClient.tsx — add back arrow (import useRouter)
- [x] **Step 6:** EditProfilePageClient.tsx — change back destination
- [x] **Step 7:** Verify build

---

### Task 4: Sidebar Active State for DM Routes

**Files:**
- Modify: `frontend/src/modules/chat/components/sidebar/SidebarClient.tsx`

**Change:** When path starts with `/dm/`, highlight "Mensajes" nav item.

```tsx
// Before:
const activeTabId = pathname === "/messages" ? "messages"
  : pathname === "/channels" ? "channels"
  : ...

// After:
const activeTabId = pathname === "/messages" || pathname.startsWith("/dm/") ? "messages"
  : pathname === "/channels" ? "channels"
  : ...
```

- [x] **Step 1:** Update activeTabId logic
- [x] **Step 2:** Verify build

---

### Task 5: Loading Skeletons for New Routes

**Files:**
- Create: `frontend/src/modules/chat/components/skeletons/ProfileSkeleton.tsx`
- Create: `frontend/src/modules/chat/components/skeletons/SettingsSkeleton.tsx`
- Create: `frontend/src/app/(chat)/profile/loading.tsx`
- Create: `frontend/src/app/(chat)/settings/loading.tsx`
- Create: `frontend/src/app/(chat)/dm/[userId]/loading.tsx`

**Pattern:**
- `ProfileSkeleton`: White card with avatar circle placeholder, text lines, grid of 3 skeleton blocks, button placeholder. Uses `animate-pulse` and `bg-gray-light`.
- `SettingsSkeleton`: Title placeholder, 3 white cards with skeleton rows inside. Same pulse animation.
- Each `loading.tsx` imports its skeleton component and renders it as default export.
- `dm/[userId]/loading.tsx` reuses existing `ChannelChatSkeleton`.

- [x] **Step 1:** Create ProfileSkeleton.tsx
- [x] **Step 2:** Create SettingsSkeleton.tsx
- [x] **Step 3:** Create profile/loading.tsx (uses ProfileSkeleton)
- [x] **Step 4:** Create settings/loading.tsx (uses SettingsSkeleton)
- [x] **Step 5:** Create dm/[userId]/loading.tsx (uses ChannelChatSkeleton)
- [x] **Step 6:** Verify build

---

### Task 6: Suspense Boundaries for Future API Integration

**Files:**
- Modify: `frontend/src/modules/chat/components/dm/DMView.tsx`
- Modify: `frontend/src/modules/chat/components/chat/ChatView.tsx`

**Pattern:**
- `Suspense` + `use()` from React 19 for suspending data fetching
- `MessageListFetcher` sub-component wraps the async operation
- `useMemo` to cache the promise and avoid infinite re-suspension
- Currently commented out with `use()` delay since mock data is synchronous
- Uncomment when connecting real API — replace delay with actual `fetch`

```tsx
// Structure left as comments for future reference:
//
// <Suspense fallback={<MessagesSpinner />}>
//   <MessageListFetcher userId={userId} />
// </Suspense>
//
// function MessageListFetcher({ userId }: { userId: string }) {
//   const delayPromise = useMemo(
//     () => new Promise<void>((resolve) => setTimeout(resolve, 2000)),
//     []
//   );
//   use(delayPromise);
//   // Replace delay with: const messages = await fetch(`/api/dm/${userId}/messages`);
//   return <MessageList messages={messages} isLoading={false} />;
// }
```

- [x] **Step 1:** Add commented Suspense structure in DMView.tsx
- [x] **Step 2:** Add commented Suspense structure in ChatView.tsx
- [x] **Step 3:** Verify build

---

### Verification Checklist

1. `/messages` is the default landing page (redirect from `/`)
2. Profile, Settings, EditProfile are wider (`max-w-2xl`) and centered on both axes
3. Every view has a back arrow `← Volver a mensajes` that navigates to `/messages`
4. Sidebar highlights "Mensajes" when on any `/dm/...` route
5. Loading skeletons show on initial page load for profile, settings, and DM pages
6. Build: `pnpm run build` passes
