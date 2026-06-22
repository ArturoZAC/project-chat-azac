"use client";

import { IconMessage } from "@tabler/icons-react";
import { UnreadList } from "./UnreadList";

export function MessagesPageClient() {
  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <IconMessage size={22} className="text-primary" />
          <h4 className="font-semibold">Mensajes</h4>
        </div>
        <p className="p-muted">Mensajes no leídos de tus canales</p>
      </div>

      <UnreadList />
    </div>
  );
}
