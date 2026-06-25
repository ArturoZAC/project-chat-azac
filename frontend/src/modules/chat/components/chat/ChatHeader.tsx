"use client";

import { IconArrowLeft, IconHash, IconLock, IconUsers } from "@tabler/icons-react";
import type { Channel } from "@/modules/chat/interfaces/channel.interface";

interface ChatHeaderProps {
  channel: Channel;
  membersCount: number;
  onToggleMembers: () => void;
  onBack?: () => void;
}

export function ChatHeader({ channel, membersCount, onToggleMembers, onBack }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-light shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors shrink-0"
            title="Volver a mensajes"
          >
            <IconArrowLeft size={18} />
          </button>
        )}
        <span className="text-silver-dark shrink-0">
          {channel.type === "PRIVATE" ? <IconLock size={18} /> : <IconHash size={18} />}
        </span>
        <div className="min-w-0">
          <h6 className="font-semibold text-sm truncate">{channel.name}</h6>
          {channel.description && (
            <p className="small-muted truncate max-w-md">{channel.description}</p>
          )}
        </div>
      </div>

      <button
        onClick={onToggleMembers}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-silver-light transition-colors"
      >
        <IconUsers size={18} className="text-silver-dark" />
        <span className="text-sm text-gray-dark font-medium">{membersCount}</span>
      </button>
    </header>
  );
}
