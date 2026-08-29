"use client";

import { useRealtimeSync } from "@/modules/chat/hooks/useRealtimeSync";

/**
 * Componente global que mantiene la lista de conversaciones (DMs + canales)
 * sincronizada en tiempo real. Se monta en el layout (chat), por lo que los
 * listeners de socket están activos en TODAS las rutas — igual que la campanita
 * de notificaciones (TopBar) — no solo en /messages.
 */
export function RealtimeSyncClient() {
  useRealtimeSync();
  return null;
}