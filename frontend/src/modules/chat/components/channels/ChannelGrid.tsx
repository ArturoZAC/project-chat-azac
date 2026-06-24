import type { Channel } from "@/modules/chat/interfaces/channel.interface";
import { ChannelCard } from "./ChannelCard";

interface ChannelGridProps {
  channels: Channel[];
}

export function ChannelGrid({ channels }: ChannelGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}
