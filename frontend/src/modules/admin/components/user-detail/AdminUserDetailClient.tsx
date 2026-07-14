"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { UserProfileCard } from "@/modules/admin/components/user-detail/UserProfileCard";
import { UserChannelsList } from "@/modules/admin/components/user-detail/UserChannelsList";
import { ActivityChart } from "@/modules/admin/components/user-detail/ActivityChart";
import { getUserAction } from "@/shared/actions/get-user.action";
import { getUserChannelsAction } from "@/shared/actions/get-user-channels.action";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";
import type { AdminUser } from "@/modules/admin/interfaces/admin.interface";

interface AdminUserDetailClientProps {
  userId: string;
}

export function AdminUserDetailClient({ userId }: AdminUserDetailClientProps) {
  const { isOnline } = useOnlineStatus();

  // User query
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => getUserAction(userId),
  });

  const isError = userData && !userData.success;

  const user: AdminUser | null = useMemo(() => {
    if (!userData?.success || !userData.data) return null;
    const u = userData.data;
    return {
      ...u,
      isOnline: isOnline(u.id),
      messageCount: 0,
      lastActiveChannel: null,
      isSuspended: false,
      twoFactorEnabled: false,
    };
  }, [userData, isOnline]);

  // Channels query
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["admin", "user", userId, "channels"],
    queryFn: () => getUserChannelsAction(userId),
    enabled: !!user,
  });

  const channels = useMemo(() => {
    if (!channelsData?.success || !channelsData.data) return [];
    return channelsData.data;
  }, [channelsData]);

  if (userLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    notFound();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-silver-dark hover:text-gray-dark transition-colors mb-4"
      >
        <IconArrowLeft size={16} />
        Volver a usuarios
      </Link>

      {/* Row 1: Profile (left) + Channels (right) — misma altura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 h-full">
          <UserProfileCard user={user} />
        </div>
        <div className="h-full">
          <UserChannelsList
            channels={channels}
            isLoading={channelsLoading}
          />
        </div>
      </div>

      {/* Row 2: Activity — full width */}
      <ActivityChart userId={userId} />
    </div>
  );
}
