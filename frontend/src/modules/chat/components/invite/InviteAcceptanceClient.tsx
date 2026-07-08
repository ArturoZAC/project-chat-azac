"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconHash, IconLinkOff } from "@tabler/icons-react";
import { acceptInvitationAction } from "@/modules/chat/actions/invitations/accept-invitation.action";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useChannelMutations } from "@/modules/chat/hooks/channels/useChannelMutations";
import { useChatStore } from "@/modules/chat/store/chat.store";

interface InviteAcceptanceClientProps {
  token: string;
}

export function InviteAcceptanceClient({
  token,
}: InviteAcceptanceClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { joinChannelMutation } = useChannelMutations();
  const queryClient = useQueryClient();
  const addJoinedChannel = useChatStore((s) => s.addJoinedChannel);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "checking-auth" | "accepting" | "redirecting" | "error"
  >("checking-auth");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Not logged in → redirect to login with return URL
      const hasSession = user !== null;
      if (!hasSession && isAuthenticated === false) {
        // Session restoration hasn't completed yet, wait
        return;
      }
      router.replace(`/login?redirect=/invite/${token}`);
      return;
    }

    setStatus("accepting");

    acceptInvitationAction(token)
      .then((res) => {
        if (!res.success) {
          setError(res.message ?? "Error al aceptar invitación");
          setStatus("error");
          return;
        }
        // Sync memberships: add channel to store and invalidate query
        addJoinedChannel(res.data.channelId);
        queryClient.invalidateQueries({ queryKey: ["memberships"] });

        setStatus("redirecting");
        // Brief delay to show success animation
        setTimeout(() => {
          router.replace(`/channels/${res.data.channelId}`);
        }, 1000);
      })
      .catch(() => {
        setError("Error al aceptar invitación");
        setStatus("error");
      });
  }, [user, isAuthenticated, token, router]);

  // ── Loading skeleton ─────────────────────────────
  if (status === "checking-auth" || status === "accepting") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Animated skeleton */}
          <div className="w-16 h-16 rounded-2xl bg-primary-light animate-pulse flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <IconHash size={28} className="text-primary" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="h-5 w-48 bg-gray-light rounded animate-pulse mb-2 mx-auto" />
            <div className="h-4 w-32 bg-gray-light rounded animate-pulse mx-auto" />
          </div>
          <p className="small-muted mt-2">
            {status === "checking-auth"
              ? "Verificando acceso..."
              : "Uniéndote al canal..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <IconLinkOff size={28} className="text-red-500" />
          </div>
          <h6 className="font-semibold">Enlace no válido</h6>
          <p className="p-muted">{error}</p>
          <button
            onClick={() => router.push("/channels")}
            className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ir a canales
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Redirecting (success) ────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center"
        >
          <IconHash size={28} className="text-green-600" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h6 className="font-semibold">¡Bienvenido al canal!</h6>
          <p className="small-muted mt-1">Redirigiendo...</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
