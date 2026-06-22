"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconHash, IconCheck } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";
import { mockMessages } from "@/modules/chat/lib/mock-data";

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

interface UnreadItem {
  channelId: string;
  channelName: string;
  unreadCount: number;
  lastMessage: string;
  lastAuthorName: string;
  lastAuthorAvatar: string | null;
  lastTime: string;
}

export function UnreadList() {
  const router = useRouter();
  const { getAllChannels, getUnreadCounts } = useChannelQueries();

  const channels = getAllChannels.data ?? [];
  const unreadCounts = getUnreadCounts.data ?? {};

  // Build unread items from mock data
  const items: UnreadItem[] = channels
    .filter((ch) => (unreadCounts[ch.id] ?? 0) > 0)
    .map((ch) => {
      const msgs = mockMessages[ch.id] ?? [];
      const last = msgs[msgs.length - 1];
      return {
        channelId: ch.id,
        channelName: ch.name,
        unreadCount: unreadCounts[ch.id] ?? 0,
        lastMessage: last ? `${last.author.username}: ${last.content}` : "",
        lastAuthorName: last?.author.username ?? "",
        lastAuthorAvatar: last?.author.avatarUrl ?? null,
        lastTime: last?.createdAt ?? ch.updatedAt,
      };
    })
    .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

  // Group by date
  const today: UnreadItem[] = [];
  const yesterday: UnreadItem[] = [];
  const older: UnreadItem[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  items.forEach((item) => {
    const itemDate = new Date(item.lastTime);
    if (itemDate >= todayStart) today.push(item);
    else if (itemDate >= yesterdayStart) yesterday.push(item);
    else older.push(item);
  });

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
            <IconCheck size={26} className="text-primary" />
          </div>
          <div>
            <h6 className="font-semibold">No hay mensajes pendientes</h6>
            <p className="p-muted text-sm max-w-xs">
              Todos los mensajes están leídos. Revisa los canales para nuevas conversaciones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderGroup = (label: string, group: UnreadItem[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-6">
        <p className="small-muted uppercase tracking-wider font-semibold mb-2 px-1">
          {label}
        </p>
        <div className="flex flex-col gap-0.5">
          {group.map((item) => (
            <UnreadItemRow key={item.channelId} item={item} onClick={() => {
              router.push(`/channels/${item.channelId}`);
            }} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto flex-1">
      {renderGroup("Hoy", today)}
      {renderGroup("Ayer", yesterday)}
      {renderGroup("Anterior", older)}
    </div>
  );
}

function UnreadItemRow({ item, onClick }: { item: UnreadItem; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-silver-light transition-colors"
    >
      {/* Channel icon */}
      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
        <IconHash size={18} className="text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">#{item.channelName}</span>
          <span className="small-muted shrink-0">{formatTimeAgo(item.lastTime)}</span>
        </div>
        <p className="text-sm text-gray-dark truncate mt-0.5">{item.lastMessage}</p>
      </div>

      {/* Unread badge */}
      {item.unreadCount > 0 && (
        <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none mt-1 shrink-0">
          {item.unreadCount}
        </span>
      )}
    </motion.button>
  );
}
