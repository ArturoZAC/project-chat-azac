import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { UserProfileCard } from "@/modules/admin/components/user-detail/UserProfileCard";
import { UserChannelsList } from "@/modules/admin/components/user-detail/UserChannelsList";
import { ActivityChart } from "@/modules/admin/components/user-detail/ActivityChart";
import { SecuritySummary } from "@/modules/admin/components/user-detail/SecuritySummary";
import {
  getAdminUserById,
  getActivityByUserId,
  getUserChannels,
} from "@/modules/admin/lib/mock-admin-data";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  const user = getAdminUserById(userId);

  if (!user) {
    notFound();
  }

  const activity = getActivityByUserId(userId);
  const channels = getUserChannels(userId);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <UserProfileCard user={user} />
          <ActivityChart data={activity} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <UserChannelsList channels={channels} />
          <SecuritySummary user={user} />
        </div>
      </div>
    </div>
  );
}
