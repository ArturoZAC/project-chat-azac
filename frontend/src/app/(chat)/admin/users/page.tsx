import { UsersPageClient } from "@/modules/admin/components/users/UsersPageClient";

export default function AdminUsersPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="h2">Usuarios</h2>
        <p className="lead2-muted mt-1">Gestiona los usuarios registrados en la plataforma</p>
      </div>

      <UsersPageClient />
    </div>
  );
}
