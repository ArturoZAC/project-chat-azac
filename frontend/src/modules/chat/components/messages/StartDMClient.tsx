"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconSearch, IconMessage, IconUserOff } from "@tabler/icons-react";
import { useConversationQueries } from "@/modules/chat/hooks/conversations/useConversationQueries";
import { useConversationMutations } from "@/modules/chat/hooks/conversations/useConversationMutations";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getInitials } from "@/shared/helpers/get-initials";
import { useOnlineStatus } from "@/modules/chat/hooks/useOnlineStatus";

export function StartDMClient() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { getUsers } = useConversationQueries();
  const { createOrGetConversationMutation } = useConversationMutations();
  const [search, setSearch] = useState("");
  const { isOnline: isUserOnline } = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const users = (getUsers.data ?? [])
    .filter((u) => u.id !== currentUser?.id)
    .filter((u) =>
      search
        ? u.username.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  const handleStartDM = async (participantId: string) => {
    try {
      const result = await createOrGetConversationMutation.mutateAsync(participantId);
      const conversationId =
        (result as { id?: string })?.id ?? (result as { conversation?: { id: string } })?.conversation?.id;
      if (conversationId) {
        router.push(`/dm/${participantId}`);
      } else {
        router.push(`/dm/${participantId}`);
      }
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
        <div className="relative">
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
      </div>

      {/* User list */}
      <div className="overflow-y-auto flex-1 px-6 pb-6">
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
            {users.map((u) => (
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
                  {(u.isOnline || isUserOnline(u.id)) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{u.username}</p>
                  <p className="small-muted truncate">
                    {u.isOnline || isUserOnline(u.id) ? "En línea" : "Desconectado"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary-light text-primary shrink-0">
                  <IconMessage size={16} />
                </div>
              </button>
            ))}
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
                  : "No hay usuarios disponibles"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
