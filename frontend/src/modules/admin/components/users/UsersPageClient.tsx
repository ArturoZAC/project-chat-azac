"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricCards } from "@/modules/admin/components/users/MetricCards";
import { UsersToolbar } from "@/modules/admin/components/users/UsersToolbar";
import { UsersTable } from "@/modules/admin/components/users/UsersTable";
import { getUsersAction } from "@/shared/actions/get-users.action";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";
import type { User } from "@/modules/auth/interfaces/user.interface";

export function UsersPageClient() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { isOnline } = useOnlineStatus();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getUsersAction(1, 100),
  });

  const isError = data && !data.success;

  const users: User[] = useMemo(() => {
    if (!data?.success) return [];
    const rawUsers: User[] = data.data?.data ?? [];
    // Override isOnline with real-time socket data
    return rawUsers.map((user) => ({
      ...user,
      isOnline: isOnline(user.id),
    }));
  }, [data, isOnline]);

  const totalUsers = users.length;
  const adminCount = useMemo(() => users.filter((u) => u.role === "ADMIN").length, [users]);
  const onlineCount = useMemo(() => users.filter((u) => u.isOnline).length, [users]);

  return (
    <>
      {/* Metrics */}
      <div className="mb-6">
        <MetricCards
          totalUsers={totalUsers}
          adminCount={adminCount}
          onlineCount={onlineCount}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-12">
          <p className="p-muted">Error al cargar usuarios</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <>
          <div className="mb-4">
            <UsersToolbar
              search={search}
              onSearchChange={setSearch}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />
          </div>
          <UsersTable users={users} search={search} roleFilter={roleFilter} />
        </>
      )}
    </>
  );
}
