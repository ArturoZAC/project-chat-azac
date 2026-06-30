"use client";

import { useRouter } from "next/navigation";
import { IconHash, IconCheck, IconMessage } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { useConversationQueries } from "@/modules/chat/hooks/useConversationQueries";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getInitials } from "@/shared/helpers/get-initials";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface ConversationItem {
  id: string;
  type: "channel" | "dm";
  name: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  avatarInitials?: string;
  isOnline?: boolean;
  href: string;
}

export function ConversationList() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { getAllChannels, getUnreadCounts, getMemberships } = useChannelQueries();
  const { getConversations } = useConversationQueries();

  const channels = getAllChannels.data ?? [];
  const memberships = getMemberships.data ?? [];
  const unreadCounts = getUnreadCounts.data ?? {};
  const conversations = getConversations.data ?? [];

  // Build conversation list: channels (memberships) + DMs
  const items: ConversationItem[] = [];

  // Add channels user is member of
  memberships.forEach((channelId) => {
    const channel = channels.find((ch) => ch.id === channelId);
    if (!channel) return;

    items.push({
      id: channelId,
      type: "channel",
      name: channel.name,
      lastMessage: "Sin mensajes aún",
      lastTime: channel.updatedAt,
      unreadCount: unreadCounts[channelId] ?? 0,
      href: `/channels/${channelId}`,
    });
  });

  // Add DM conversations from API
  conversations.forEach((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p.id !== currentUser?.id,
    );
    if (!otherParticipant) return;

    items.push({
      id: conv.conversation.id,
      type: "dm",
      name: otherParticipant.username,
      lastMessage: conv.lastMessage
        ? `${
            conv.lastMessage.senderId === currentUser?.id
              ? "Tú"
              : otherParticipant.username
          }: ${conv.lastMessage.content}`
        : "Sin mensajes aún",
      lastTime: conv.lastMessage?.createdAt ?? conv.conversation.updatedAt,
      unreadCount: conv.unreadCount,
      avatarInitials: getInitials(otherParticipant.username),
      isOnline: true, // We could get online status from the participants list
      href: `/dm/${otherParticipant.id}`,
    });
  });

  // Sort by last activity (most recent first)
  items.sort(
    (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime(),
  );

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconCheck size={26} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">No hay conversaciones</h6>
            <p className="p-muted text-sm max-w-xs">
              Únete a canales o inicia una conversación para verla aquí.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 px-6 py-4">
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ConversationItemRow
            key={`${item.type}-${item.id}`}
            item={item}
            onClick={() => router.push(item.href)}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItemRow({
  item,
  onClick,
}: {
  item: ConversationItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-xl bg-white border border-gray-light shadow-sm hover:bg-silver-light hover:border-gray-mid hover:shadow-md transition-all duration-200"
    >
      {/* Icon / Avatar */}
      {item.type === "channel" ? (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
          <IconHash size={18} className="text-primary" />
        </div>
      ) : (
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <span className="p-white text-xs font-semibold">
              {item.avatarInitials}
            </span>
          </div>
          {item.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 self-center">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold truncate">
            {item.type === "channel" ? `#${item.name}` : item.name}
          </span>
          <span className="small-muted shrink-0">
            {formatTimeAgo(item.lastTime)}
          </span>
        </div>
        <p className="p-muted truncate mt-0.5">{item.lastMessage}</p>
      </div>

      {/* Unread badge */}
      {item.unreadCount > 0 && (
        <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none mt-1 shrink-0">
          {item.unreadCount}
        </span>
      )}
    </button>
  );
}
