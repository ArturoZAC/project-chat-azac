"use client";

import { IconSearch } from "@tabler/icons-react";
import { CustomSelect } from "@/shared/ui/CustomSelect";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

const ROLE_OPTIONS = [
  { value: "all", label: "Todos los roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "Usuario" },
];

export function UsersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UsersToolbarProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <IconSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-dark pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-light bg-white text-sm placeholder:text-silver-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Role filter */}
      <CustomSelect
        value={roleFilter}
        onChange={onRoleFilterChange}
        options={ROLE_OPTIONS}
        className="w-52"
      />
    </div>
  );
}
