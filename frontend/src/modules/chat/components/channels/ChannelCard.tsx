"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconHash, IconLock, IconUsers, IconArrowRight } from "@tabler/icons-react";
import type { Channel } from "@/shared/interfaces/channel.interface";
import { useChannelMutations } from "@/modules/chat/hooks/useChannelMutations";
import { useChannelQueries } from "@/modules/chat/hooks/useChannelQueries";

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
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      className={`
        border border-gray-light rounded-xl p-4 transition-all duration-200
        ${isMember ? "cursor-pointer hover:border-accent hover:shadow-sm" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            {channel.type === "PRIVATE" ? (
              <IconLock size={18} className="text-primary" />
            ) : (
              <IconHash size={18} className="text-primary" />
            )}
          </span>
          <div>
            <h6 className="text-sm font-semibold leading-tight">{channel.name}</h6>
            <span className="small-muted">{channel.type === "PRIVATE" ? "Privado" : "Público"}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {channel.description && (
        <p className="p-muted text-sm line-clamp-2 mb-3">{channel.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-silver-dark">
          <IconUsers size={15} />
          <small className="text-silver-dark">{channel.membersCount} miembros</small>
        </div>

        {isMember ? (
          <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            Ver canal
            <IconArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isJoining ? "Uniéndose..." : "Unirse"}
          </button>
        )}
      </div>
    </motion.article>
  );
}
