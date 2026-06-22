"use client";

import { useRouter, usePathname } from "next/navigation";
import { IconHash, IconMessage, IconDotsVertical } from "@tabler/icons-react";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";

const NAV_ITEMS = [
  { id: "messages", label: "Mensajes", icon: IconMessage, path: "/messages" },
  { id: "channels", label: "Canales", icon: IconHash, path: "/channels" },
] as const;

export function SidebarClient() {
  const { activeTab, setActiveTab } = useChatStore();
  const { getTotalUnread, getMemberships } = useChannelQueries();
  const router = useRouter();
  const pathname = usePathname();

  const totalUnread = getTotalUnread.data ?? 0;
  const memberships = getMemberships.data ?? [];
  const currentUser = mockUsers.find((user) => user.id === currentUserId)!;

  // Sync activeTab with current path
  const currentPath = pathname.split("/")[1];
  const activeTabId = currentPath === "messages" ? "messages" : "channels";

  const handleNavigation = (item: typeof NAV_ITEMS[number]) => {
    setActiveTab(item.id);
    router.push(item.path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <span className="subtitle1-primary font-bold tracking-tight">4Z4C</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTabId === item.id;
          const showBadge = item.id === "messages" && totalUnread > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                ${isActive ? "bg-primary-light" : "hover:bg-silver-light"}
              `}
            >
              <Icon
                size={20}
                className={isActive ? "text-primary" : "text-silver-dark"}
              />
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
            </button>
          );
        })}

        {/* Channel list in sidebar (shortcut) */}
        {memberships.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => router.push("/channels")}
              className="w-full text-left px-3 pb-1 small-muted uppercase tracking-wider font-semibold hover:text-gray-dark transition-colors"
            >
              Mis canales
            </button>
            <div className="flex flex-col gap-0.5">
              {memberships.slice(0, 5).map((channelId) => (
                <ChannelShortcut key={channelId} channelId={channelId} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-light px-4 py-3 flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="p-white text-xs font-semibold">
              {getInitials(currentUser.username)}
            </span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{currentUser.username}</p>
          <p className="small-muted truncate">Online</p>
        </div>

        <button className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors">
          <IconDotsVertical size={16} />
        </button>
      </div>
    </div>
  );
}

function ChannelShortcut({ channelId }: { channelId: string }) {
  const router = useRouter();
  const { getChannel } = useChannelQueries(channelId);
  const channel = getChannel.data;

  if (!channel) return null;

  return (
    <button
      onClick={() => router.push(`/channels/${channel.id}`)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-silver-light transition-colors text-left"
    >
      <IconHash size={16} className="text-silver-dark shrink-0" />
      <span className="text-sm text-gray-dark truncate">{channel.name}</span>
    </button>
  );
}
