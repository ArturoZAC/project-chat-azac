# Plan: Sidebar / Conversation List Empty on First Visit After Login

## Bug
After login redirect to `/messages`, the sidebar shows "No tienes conversaciones" and "Aún no estás dentro de algún canal", and the conversation list shows "No hay conversaciones". Only after a manual page refresh do conversations and channels appear.

## Root Cause

**Race condition between session restoration and data queries.**

On login flow:

1. `LoginFormFields` calls `setSession(userId)` and `router.push("/messages")`
2. `(chat)/layout.tsx` mounts → `SessionRestore` renders children **immediately**
3. `SidebarClient` and `ConversationList` mount and fire their TanStack Query hooks (`getConversations`, `getChannels`, `getMemberships`) right away
4. `SessionRestore.useEffect` fires and calls `restoreSessionAction()` asynchronously

The problem: The API queries in step 3 run before the auth session is fully restored in step 4. While the JWT cookie exists and the API should technically work, there's a window where queries can resolve with empty/no data before the auth store's `user` object is populated. Once the queries cache empty results, they don't automatically refetch (staleTime is 30s at global level).

On hard refresh, the page loads fresh, `SessionRestore` fires immediately, queries fire with a fully populated auth store, and data returns correctly.

## Fix Strategy

Ensure queries for sidebar data **do not fire until the session is fully restored**.

### Changes

1. **Auth store** (`auth.store.ts`): Add `isSessionReady: boolean` field and `setSessionReady()` action. Default is `false`.
2. **SessionRestore** (`SessionRestore.tsx`): Call `setSessionReady()` after the async `restore()` completes (both success and failure cases).
3. **Query hooks** (`useChannelQueries.ts`, `useConversationQueries.ts`): Accept an optional `enabled` parameter (default `true`) and pass it to all collection queries (getAllChannels, getConversations, getMemberships, getMembers, getMessages).
4. **SidebarClient** (`SidebarClient.tsx`): Read `isSessionReady` from auth store, pass to query hooks. Show a loading skeleton while `!isSessionReady`.
5. **ConversationList** (`ConversationList.tsx`): Same — read `isSessionReady`, pass to hooks, keep skeleton until ready.

### Files to modify
- `frontend/src/modules/auth/store/auth.store.ts`
- `frontend/src/modules/auth/components/SessionRestore.tsx`
- `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts`
- `frontend/src/modules/chat/hooks/conversations/useConversationQueries.ts`
- `frontend/src/modules/chat/components/sidebar/SidebarClient.tsx`
- `frontend/src/modules/chat/components/messages/ConversationList.tsx`

## Verification
1. Clear cookies / use incognito
2. Login with valid credentials
3. Verify redirect to `/messages` shows loading skeletons (not "no data" empty states)
4. Verify after ~1s the sidebar and conversation list populate with data
5. Hard refresh → verify data loads immediately from cache
