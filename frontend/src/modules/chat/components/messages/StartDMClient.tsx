"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconSearch, IconMessage, IconUserOff, IconUsers, IconUser, IconUserCircle } from "@tabler/icons-react";
import { useConversationQueries } from "@/modules/chat/hooks/conversations/useConversationQueries";
import { useConversationMutations } from "@/modules/chat/hooks/conversations/useConversationMutations";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getInitials } from "@/shared/helpers/get-initials";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";

type FilterStatus = "all" | "online" | "offline";

export function StartDMClient() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { getUsers } = useConversationQueries();
  const { createOrGetConversationMutation } = useConversationMutations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { isOnline: isUserOnline, hasSynced } = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const users = useMemo(() => {
    const allUsers = (getUsers.data ?? [])
      .filter((u) => u.id !== currentUser?.id)
      .filter((u) =>
        search
          ? u.username.toLowerCase().includes(search.toLowerCase())
          : true,
      );

    // Apply online/offline filter
    // Use socket-based status (isUserOnline) as primary source.
    // Fall back to API u.isOnline only if socket hasn't synced yet.
    switch (filter) {
      case "online":
        return allUsers.filter((u) => (hasSynced ? isUserOnline(u.id) : u.isOnline));
      case "offline":
        return allUsers.filter((u) => !(hasSynced ? isUserOnline(u.id) : u.isOnline));
      default:
        return allUsers;
    }
  }, [getUsers.data, currentUser?.id, search, filter, isUserOnline, hasSynced]);

  const handleStartDM = async (participantId: string) => {
    try {
      const result = await createOrGetConversationMutation.mutateAsync(participantId);
      const conversationId =
        (result as { id?: string })?.id ?? (result as { conversation?: { id: string } })?.conversation?.id;
      router.push(`/dm/${participantId}`);
    } catch {
      router.push(`/dm/${participantId}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-ultra">
      {/* Header */}
      <div className="p-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/messages")}
            className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors shrink-0"
            title="Volver"
          >
            <IconArrowLeft size={20} />
          </button>
          <div>
            <h4 className="font-semibold">Nueva conversación</h4>
            <p className="p-muted">Selecciona un usuario para empezar a chatear</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-dark"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-silver-light rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "all"
                ? "bg-white text-gray-dark shadow-sm"
                : "text-gray-mid hover:text-gray-dark"
            }`}
          >
            <IconUsers size={15} />
            Todos
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "online"
                ? "bg-white text-gray-dark shadow-sm"
                : "text-gray-mid hover:text-gray-dark"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            En línea
          </button>
          <button
            onClick={() => setFilter("offline")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "offline"
                ? "bg-white text-gray-dark shadow-sm"
                : "text-gray-mid hover:text-gray-dark"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-gray-mid shrink-0" />
            Desconectados
          </button>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto flex-1 min-h-0 px-6 pb-6">
        {!mounted ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-light animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-light shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-4 w-28 bg-gray-light rounded" />
                  <div className="h-3 w-16 bg-gray-light rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="flex flex-col gap-1">
            {users.map((u) => {
              const isOnline = hasSynced ? isUserOnline(u.id) : u.isOnline;
              return (
                <button
                  key={u.id}
                  onClick={() => handleStartDM(u.id)}
                  disabled={createOrGetConversationMutation.isPending}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-white border border-gray-light hover:bg-silver-light hover:border-gray-mid transition-all duration-200 disabled:opacity-60"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="p-white text-xs font-semibold">
                        {getInitials(u.username)}
                      </span>
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.username}</p>
                    <p className="small-muted truncate">
                      {isOnline ? "En línea" : "Desconectado"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary-light text-primary shrink-0">
                    <IconMessage size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center mt-12">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
              <IconUserOff size={26} className="text-primary" />
            </div>
            <div>
              <h6 className="font-semibold">Sin resultados</h6>
              <p className="p-muted text-sm max-w-xs">
                {search
                  ? `No hay usuarios que coincidan con "${search}"`
                  : filter === "online"
                    ? "No hay usuarios en línea"
                    : filter === "offline"
                      ? "No hay usuarios desconectados"
                      : "No hay usuarios disponibles"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
