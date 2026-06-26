import { UsersPageClient } from "@/modules/admin/components/users/UsersPageClient";
import { mockAdminUsers } from "@/modules/admin/lib/mock-admin-data";

export default function AdminUsersPage() {
  const totalUsers = mockAdminUsers.length;
  const adminCount = mockAdminUsers.filter((u) => u.role === "ADMIN").length;
  const onlineCount = mockAdminUsers.filter((u) => u.isOnline).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="h2">Usuarios</h2>
        <p className="lead2-muted mt-1">Gestiona los usuarios registrados en la plataforma</p>
      </div>

      <UsersPageClient
        users={mockAdminUsers}
        totalUsers={totalUsers}
        adminCount={adminCount}
        onlineCount={onlineCount}
      />
    </div>
  );
}
