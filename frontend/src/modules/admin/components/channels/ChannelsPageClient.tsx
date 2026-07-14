"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminChannelsToolbar } from "@/modules/admin/components/channels/AdminChannelsToolbar";
import { AdminChannelsTable } from "@/modules/admin/components/channels/AdminChannelsTable";
import { CreateChannelModal } from "@/modules/admin/components/channels/CreateChannelModal";
import { getChannelsAction } from "@/shared/actions/get-channels.action";
import type { AdminChannel } from "@/modules/admin/interfaces/admin.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";

type FilterType = "all" | "PUBLIC" | "PRIVATE";

function mapBackendToAdmin(ch: ChannelBackend): AdminChannel {
  return {
    id: ch.id,
    name: ch.name,
    description: ch.description ?? undefined,
    type: ch.isPrivate ? "PRIVATE" : "PUBLIC",
    owner: ch.creator ?? { id: ch.createdById, username: "Desconocido" },
    creator: ch.creator ?? { id: ch.createdById, username: "Desconocido" },
    membersCount: ch.membersCount,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
    lastMessage: ch.lastMessage ?? undefined,
    memberList: [],
  };
}

export function ChannelsPageClient() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "channels"],
    queryFn: () => getChannelsAction(1, 100),
  });

  const isError = data && !data.success;

  const channels: AdminChannel[] = useMemo(() => {
    if (!data?.success) return [];
    return data.data.data.map(mapBackendToAdmin);
  }, [data]);

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
          (ch.description && ch.description.toLowerCase().includes(q)),
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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-12">
          <p className="p-muted">Error al cargar canales</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <AdminChannelsTable channels={filteredChannels} />
      )}

      <CreateChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
