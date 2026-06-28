"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  IconHash,
  IconMessage,
  IconDotsVertical,
  IconMoodSad,
  IconUser,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useUIStore } from "@/shared/store/ui.store";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { useConversationQueries } from "@/modules/chat/hooks/useConversationQueries";
import { useAuthStore } from "@/modules/auth/store/auth.store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const NAV_ITEMS = [
  { id: "messages", label: "Mensajes", icon: IconMessage, path: "/messages" },
  { id: "channels", label: "Canales", icon: IconHash, path: "/channels" },
  { id: "profile", label: "Perfil", icon: IconUser, path: "/profile" },
  { id: "settings", label: "Configuración", icon: IconSettings, path: "/settings" },
] as const;

export function SidebarClient() {
  const { activeTab, setActiveTab } = useChatStore();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { getTotalUnread: getChannelUnread, getMemberships } = useChannelQueries();
  const { getTotalUnread: getConvUnread, getUsers } = useConversationQueries();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  const totalChannelUnread = getChannelUnread.data ?? 0;
  const totalConvUnread = getConvUnread.data ?? 0;
  const totalUnread = totalChannelUnread + totalConvUnread;
  const memberships = getMemberships.data ?? [];
  const users = getUsers.data ?? [];
  const currentUser = user;

  // Sync activeTab with current path
  const activeTabId = pathname === "/messages" || pathname.startsWith("/dm/") ? "messages"
    : pathname === "/channels" ? "channels"
    : pathname === "/profile" ? "profile"
    : pathname === "/settings" ? "settings"
    : null;

  const handleNavigation = (item: typeof NAV_ITEMS[number]) => {
    if (item.id === "messages" || item.id === "channels") {
      setActiveTab(item.id);
    }
    router.push(item.path);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${isSidebarCollapsed ? "w-[64px]" : "w-[260px]"}`}>
      {/* Logo */}
      <div className={`px-6 pt-6 pb-4 ${isSidebarCollapsed ? "flex justify-center px-0" : ""}`}>
        <span className="subtitle1-primary font-bold tracking-tight">4Z4C</span>
      </div>

      {/* Navigation */}
      <nav className={`flex flex-col gap-1 ${isSidebarCollapsed ? "px-2 items-center" : "px-3"}`}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTabId === item.id;
          const showBadge = item.id === "messages" && totalUnread > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 rounded-lg transition-all duration-150
                ${isSidebarCollapsed
                  ? "p-2.5 justify-center"
                  : "px-3 py-2.5 w-full"
                }
                ${isActive ? "bg-primary-light" : "hover:bg-silver-light"}
              `}
            >
              <Icon
                size={20}
                className={isActive ? "text-primary" : "text-silver-dark shrink-0"}
              />
              {!isSidebarCollapsed && (
                <>
                  <span
                    className={`flex-1 text-left btn-sans text-sm font-medium ${
                      isActive ? "span-primary" : "span-muted"
                    }`}
                  >
                    {item.label}
                  </span>

                  {showBadge && (
                    <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </>
              )}
              {isSidebarCollapsed && showBadge && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Scrollable area: channels + DMs */}
      {!isSidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 mt-2 space-y-3">
          {/* ====== DIRECTOS ====== */}
          <div>
            <button
              onClick={() => router.push("/messages")}
              className="w-full text-left px-3 pb-1 small-muted uppercase tracking-wider font-semibold hover:text-gray-dark transition-colors flex items-center justify-between"
            >
              <span>Directos</span>
              <IconMessageCircle size={14} className="text-silver-dark" />
            </button>

            {users.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {users
                  .filter((u) => u.id !== currentUser?.id)
                  .slice(0, 6)
                  .map((u) => (
                    <UserShortcut
                      key={u.id}
                      userId={u.id}
                      username={u.username}
                      isOnline={u.isOnline}
                      onClick={() => router.push(`/dm/${u.id}`)}
                    />
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
                  <IconMoodSad size={20} className="text-silver-dark" />
                </div>
                <p className="p-muted text-sm">
                  No hay usuarios disponibles
                </p>
              </div>
            )}
          </div>

          {/* ====== MIS CANALES ====== */}
          <div>
            <button
              onClick={() => router.push("/channels")}
              className="w-full text-left px-3 pb-1 small-muted uppercase tracking-wider font-semibold hover:text-gray-dark transition-colors"
            >
              Mis canales
            </button>

            {memberships.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {memberships.slice(0, 5).map((channelId) => (
                  <ChannelShortcut key={channelId} channelId={channelId} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
                  <IconMoodSad size={20} className="text-silver-dark" />
                </div>
                <p className="p-muted text-sm">
                  Aún no estás dentro de algún canal
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed mode: just icons */}
      {isSidebarCollapsed && (
        <div className="flex-1" />
      )}

      {/* User profile + collapse toggle */}
      <div className={`border-t border-gray-light px-4 py-3 flex items-center gap-3 ${isSidebarCollapsed ? "flex-col px-2" : ""}`}>
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="p-white text-xs font-semibold">
              {currentUser ? getInitials(currentUser.username) : "?"}
            </span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>

        {/* User info — only when expanded */}
        {!isSidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{currentUser?.username ?? "Usuario"}</p>
            <p className="small-muted truncate">Online</p>
          </div>
        )}

        {/* Toggle collapse button */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors shrink-0 ${isSidebarCollapsed ? "mt-2" : ""}`}
          title={isSidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isSidebarCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );
}

function UserShortcut({
  userId,
  username,
  isOnline,
  onClick,
}: {
  userId: string;
  username: string;
  isOnline: boolean;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === `/dm/${userId}`;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-left w-full
        ${isActive ? "bg-primary-light" : "hover:bg-silver-light"}
      `}
    >
      <div className="relative shrink-0">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-primary">
            {getInitials(username)}
          </span>
        </div>
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
        )}
      </div>
      <span className={`text-sm truncate ${isActive ? "span-primary" : "text-gray-dark"}`}>
        {username}
      </span>
    </button>
  );
}

function ChannelShortcut({ channelId }: { channelId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getChannel } = useChannelQueries(channelId);
  const channel = getChannel.data;

  if (!channel) return null;

  // Extract channel ID from current URL: "/channels/ch1" → "ch1"
  const activeChannelId = pathname.split("/").pop();
  const isActive = activeChannelId === channel.id;

  return (
    <button
      onClick={() => router.push(`/channels/${channel.id}`)}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-left
        ${isActive ? "bg-primary-light" : "hover:bg-silver-light"}
      `}
    >
      <IconHash
        size={16}
        className={`${isActive ? "text-primary" : "text-silver-dark"} shrink-0`}
      />
      <span className={`text-sm truncate ${isActive ? "span-primary" : "text-gray-dark"}`}>
        {channel.name}
      </span>
    </button>
  );
}
