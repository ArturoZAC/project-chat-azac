"use client";

import { IconSearch, IconPlus } from "@tabler/icons-react";

type FilterType = "all" | "PUBLIC" | "PRIVATE";

interface AdminChannelsToolbarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "PUBLIC", label: "Públicos" },
  { value: "PRIVATE", label: "Privados" },
];

export function AdminChannelsToolbar({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  onCreateClick,
}: AdminChannelsToolbarProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Pill filters */}
      <div className="flex items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-white"
                : "bg-silver-light text-gray-dark hover:bg-gray-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <IconSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-dark pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar canales..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-light bg-white text-sm placeholder:text-silver-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Create button */}
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        <IconPlus size={18} />
        Crear canal
      </button>
    </div>
  );
}
