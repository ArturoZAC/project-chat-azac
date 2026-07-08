"use client";

import { useRouter } from "next/navigation";
import { IconHash, IconLock, IconUsers, IconArrowRight } from "@tabler/icons-react";
import type { Channel } from "@/modules/chat/interfaces/channels/channel.interface";
import { useChannelMutations } from "@/modules/chat/hooks/channels/useChannelMutations";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const router = useRouter();
  const { getMemberships } = useChannelQueries();
  const { joinChannelMutation } = useChannelMutations();

  const memberships = getMemberships.data ?? [];
  const isMember = memberships.includes(channel.id);
  const isJoining = joinChannelMutation.isPending;

  const handleClick = () => {
    if (isMember) {
      router.push(`/channels/${channel.id}`);
    }
  };

  const handleJoin = (event: React.MouseEvent) => {
    event.stopPropagation();
    joinChannelMutation.mutate(channel.id);
  };

  return (
    <article
      onClick={handleClick}
      className={`
        bg-white border border-gray-light rounded-xl p-4 transition-all duration-200
        ${isMember
          ? "cursor-pointer hover:border-accent hover:shadow-md"
          : "shadow-sm"}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
            {channel.type === "PRIVATE" ? (
              <IconLock size={18} className="text-primary" />
            ) : (
              <IconHash size={18} className="text-primary" />
            )}
          </span>
          <div className="min-w-0">
            <h6 className="font-semibold leading-tight truncate">{channel.name}</h6>
            <span className="small-muted">{channel.type === "PRIVATE" ? "Privado" : "Público"}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {channel.description && (
        <p className="p-muted line-clamp-2 mb-3 leading-relaxed">{channel.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-silver-dark">
          <IconUsers size={15} />
          <small className="text-silver-dark">{channel.membersCount} miembros</small>
        </div>

        {isMember ? (
          <button className="flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors group">
            <span className="btn-sans text-sm">Ver canal</span>
            <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : channel.type === "PRIVATE" ? (
          <span className="small-muted italic">Solo invitación</span>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="bg-primary hover:bg-primary-hover px-4 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:shadow-md hover:shadow-primary/20 active:scale-[0.97]"
          >
            <span className="btn-sans text-sm font-medium span-white">
              {isJoining ? "Uniéndose..." : "Unirse"}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
