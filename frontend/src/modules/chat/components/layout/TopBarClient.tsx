"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { IconBell, IconChevronRight } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";
import { mockAdminUsers, mockAdminChannels } from "@/modules/admin/lib/mock-admin-data";
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

    // /admin/users
    if (segments[0] === "admin" && segments[1] === "users" && segments.length === 2) {
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Usuarios" },
      ];
    }

    // /admin/users/:userId
    if (segments[0] === "admin" && segments[1] === "users" && segments.length >= 3) {
      const userId = segments[2];
      // Try to find the username from mock data
      const user = mockAdminUsers.find((u) => u.id === userId);
      const label = user?.username ?? decodeURIComponent(userId);
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Usuarios", href: "/admin/users" },
        { label },
      ];
    }

    // /admin/channels
    if (segments[0] === "admin" && segments[1] === "channels" && segments.length === 2) {
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Canales" },
      ];
    }

    // /admin/channels/:channelId
    if (segments[0] === "admin" && segments[1] === "channels" && segments.length >= 3) {
      const channelId = segments[2];
      const channel = mockAdminChannels.find((ch) => ch.id === channelId);
      const label = channel?.name ?? decodeURIComponent(channelId);
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Canales", href: "/admin/channels" },
        { label },
      ];
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
