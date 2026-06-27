import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { mockMessages } from "@/modules/chat/lib/mock-data";
import { ChannelProfileCard } from "@/modules/admin/components/channel-detail/ChannelProfileCard";
import { ChannelStatsCards } from "@/modules/admin/components/channel-detail/ChannelStatsCards";
import { ChannelPieChart } from "@/modules/admin/components/channel-detail/ChannelPieChart";
import { ChannelMembersTable } from "@/modules/admin/components/channel-detail/ChannelMembersTable";
import {
  getAdminChannelById,
  getChannelMessageDistribution,
} from "@/modules/admin/lib/mock-admin-data";

interface Props {
  params: Promise<{ channelId: string }>;
}

function getMessagesThisWeek(channelId: string): number {
  const msgs = mockMessages[channelId];
  if (!msgs) return 0;

  // Mock "this week": count messages from June 19 onwards
  const threshold = new Date("2026-06-19T00:00:00Z").getTime();
  return msgs.filter((m) => new Date(m.createdAt).getTime() >= threshold).length;
}

export default async function AdminChannelDetailPage({ params }: Props) {
  const { channelId } = await params;
  const channel = getAdminChannelById(channelId);

  if (!channel) {
    notFound();
  }

  const distribution = getChannelMessageDistribution(channelId);
  const totalMessages = distribution.reduce((sum, d) => sum + d.messages, 0);
  const activeMembers = distribution.length;
  const messagesThisWeek = getMessagesThisWeek(channelId);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Back button */}
      <Link
        href="/admin/channels"
        className="inline-flex items-center gap-1.5 text-sm text-silver-dark hover:text-gray-dark transition-colors mb-4"
      >
        <IconArrowLeft size={16} />
        Volver a canales
      </Link>

      {/* Stats Cards */}
      <div className="mb-6">
        <ChannelStatsCards
          totalMessages={totalMessages}
          membersCount={channel.membersCount}
          activeMembers={activeMembers}
          messagesThisWeek={messagesThisWeek}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <ChannelProfileCard channel={channel} />
          <ChannelPieChart data={distribution} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <ChannelMembersTable channel={channel} />
        </div>
      </div>
    </div>
  );
}
