"use client";

import { useState } from "react";
import { MetricCards } from "@/modules/admin/components/users/MetricCards";
import { UsersToolbar } from "@/modules/admin/components/users/UsersToolbar";
import { UsersTable } from "@/modules/admin/components/users/UsersTable";
import type { AdminUser } from "@/modules/admin/interfaces/admin.interface";

interface UsersPageClientProps {
  users: AdminUser[];
  totalUsers: number;
  adminCount: number;
  onlineCount: number;
}

export function UsersPageClient({
  users,
  totalUsers,
  adminCount,
  onlineCount,
}: UsersPageClientProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

      {/* Toolbar */}
      <div className="mb-4">
        <UsersToolbar
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </div>

      {/* Table */}
      <UsersTable users={users} search={search} roleFilter={roleFilter} />
    </>
  );
}
