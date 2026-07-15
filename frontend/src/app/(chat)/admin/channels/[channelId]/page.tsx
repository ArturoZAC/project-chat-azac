"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IconArrowLeft, IconMoodSad } from "@tabler/icons-react";
import { ChannelProfileCard } from "@/modules/admin/components/channel-detail/ChannelProfileCard";
import { ChannelMembersTable } from "@/modules/admin/components/channel-detail/ChannelMembersTable";
import { ChannelPieChart } from "@/modules/admin/components/channel-detail/ChannelPieChart";
import { getChannelAction } from "@/shared/actions/get-channel.action";
import { getChannelMembersAction } from "@/shared/actions/get-channel-members.action";
import { getChannelDistributionAction } from "@/shared/actions/get-channel-distribution.action";
import type { UserMessageCount } from "@/shared/actions/get-channel-distribution.action";
import { PIE_COLORS } from "@/shared/helpers/format";

export default function AdminChannelDetailPage() {
  const params = useParams<{ channelId: string }>();
  const channelId = params.channelId;

  const channelQuery = useQuery({
    queryKey: ["admin", "channel", channelId],
    queryFn: () => getChannelAction(channelId),
    enabled: !!channelId,
  });

  const membersQuery = useQuery({
    queryKey: ["admin", "channel", channelId, "members"],
    queryFn: () => getChannelMembersAction(channelId),
    enabled: !!channelId,
  });

  const distributionQuery = useQuery({
    queryKey: ["admin", "channel", channelId, "distribution"],
    queryFn: () => getChannelDistributionAction(channelId),
    enabled: !!channelId,
    gcTime: 0,
  });

  const channel = channelQuery.data?.success ? channelQuery.data.data : null;

  const members = useMemo(() => {
    if (!membersQuery.data?.success) return [];
    return membersQuery.data.data;
  }, [membersQuery.data]);

  const distribution = useMemo(() => {
    if (!distributionQuery.data?.success) return [];
    return distributionQuery.data.data.map(
      (entry: UserMessageCount, index: number) => ({
        ...entry,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  }, [distributionQuery.data]);

  const isLoading = channelQuery.isLoading || membersQuery.isLoading || distributionQuery.isLoading;
  const isError = channelQuery.data && !channelQuery.data.success;

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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-silver-light flex items-center justify-center">
            <IconMoodSad size={24} className="text-silver-dark" />
          </div>
          <p className="h5">Canal no encontrado</p>
          <p className="p-muted">El recurso que buscas no existe o ha sido eliminado.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && channel && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <ChannelProfileCard channel={channel} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <ChannelMembersTable members={members} />
            </div>
          </div>

          {/* Chart - full width */}
          <div className="mt-6">
            <ChannelPieChart data={distribution} />
          </div>
        </>
      )}
    </div>
  );
}
