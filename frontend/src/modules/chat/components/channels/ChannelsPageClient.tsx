"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { ChannelGrid } from "./ChannelGrid";
import { CreateChannelModal } from "./CreateChannelModal";

export function ChannelsPageClient() {
  const { user } = useAuthStore();

  const { getAllChannels } = useChannelQueries();
  const { setCreateModalOpen } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Ensures server render matches client's first render (both show skeleton),
  // then client switches to real content without hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  const channels = getAllChannels.data ?? [];
  const isLoading = getAllChannels.isLoading;

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (channel.description &&
        channel.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const skeletonCards = Array.from({ length: 4 });

  const showSkeleton = !mounted || isLoading;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-semibold">Explorar Canales</h4>
          <p className="p-muted mt-0.5">Encuentra canales para unirte o crea uno nuevo</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
        >
          <IconPlus size={18} className="text-white" />
          <span className="btn-sans text-sm font-medium span-white">Crear canal</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <IconSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-dark pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar canales..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid placeholder:text-gray-mid"
        />
      </div>

      {/* Content */}
      {showSkeleton ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skeletonCards.map((_placeholder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-light rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-light" />
                <div>
                  <div className="h-4 w-28 bg-gray-light rounded" />
                  <div className="h-3 w-16 bg-gray-light rounded mt-1" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-light rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-light rounded mb-3" />
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-gray-light rounded" />
                <div className="h-7 w-16 bg-gray-light rounded" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
            <IconSearch size={28} className="text-primary" />
          </div>
          <h6 className="font-semibold mb-1">Sin resultados</h6>
          <p className="p-muted text-sm text-center max-w-xs">
            {searchQuery
              ? `No encontramos canales para "${searchQuery}"`
              : "Aún no hay canales disponibles"}
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1">
          <ChannelGrid channels={filteredChannels} />
        </div>
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal />
    </div>
  );
}
