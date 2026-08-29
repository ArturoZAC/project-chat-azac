"use client";

import { IconMessage } from "@tabler/icons-react";
import { ConversationList } from "./ConversationList";

export function MessagesPageClient() {
  return (
    <div className="flex flex-col h-full bg-gray-ultra">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
            <IconMessage size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Mensajes</h4>
            <p className="p-muted">Todas tus conversaciones en un solo lugar</p>
          </div>
        </div>
      </div>

      <ConversationList />
    </div>
  );
}
