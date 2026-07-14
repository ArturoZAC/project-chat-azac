import { AdminUserDetailClient } from "@/modules/admin/components/user-detail/AdminUserDetailClient";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  return <AdminUserDetailClient userId={userId} />;
}
