"use client";

import { useState, useMemo } from "react";
import { AdminChannelsToolbar } from "@/modules/admin/components/channels/AdminChannelsToolbar";
import { AdminChannelsTable } from "@/modules/admin/components/channels/AdminChannelsTable";
import { CreateChannelModal } from "@/modules/admin/components/channels/CreateChannelModal";
import type { AdminChannel } from "@/modules/admin/interfaces/admin.interface";

type FilterType = "all" | "PUBLIC" | "PRIVATE";

interface ChannelsPageClientProps {
  channels: AdminChannel[];
}

export function ChannelsPageClient({ channels }: ChannelsPageClientProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredChannels = useMemo(() => {
    let result = channels;

    if (activeFilter !== "all") {
      result = result.filter((ch) => ch.type === activeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          (ch.description && ch.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [channels, activeFilter, search]);

  return (
    <>
      <div className="mb-4">
        <AdminChannelsToolbar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          onCreateClick={() => setIsModalOpen(true)}
        />
      </div>

      <AdminChannelsTable channels={filteredChannels} />

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
