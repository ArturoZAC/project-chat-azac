"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { logoutAction } from "@/modules/auth/actions/logout.action";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import { useChatStore } from "@/modules/chat/store/chat.store";

/**
 * Centralized logout: calls the API, then wipes every client-side cache
 * (TanStack Query, notification store, chat store) so the next session
 * starts completely clean. `clearSession` also flips `isAuthenticated`
 * to false, which makes the SocketProvider disconnect the socket.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return async function handleLogout() {
    await logoutAction();

    // Wipe cached queries (channels, conversations, unread) from the previous user
    queryClient.clear();

    // Wipe client-side chat + notification state
    useNotificationStore.getState().reset();
    useChatStore.getState().reset();

    // Drop the auth session (triggers SocketProvider disconnect)
    clearSession();

    router.push("/login");
  };
}
