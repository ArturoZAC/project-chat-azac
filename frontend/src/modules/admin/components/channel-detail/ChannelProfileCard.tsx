"use client";

import {
  IconHash,
  IconCalendar,
  IconClock,
  IconEdit,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import type { AdminChannel } from "@/modules/admin/interfaces/admin.interface";
import { formatDate } from "@/modules/admin/lib/mock-admin-data";

interface ChannelProfileCardProps {
  channel: AdminChannel;
}

export function ChannelProfileCard({ channel }: ChannelProfileCardProps) {
  const handleAction = (action: string) => {
    console.log(`[MOCK] ${action} canal:`, channel.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      {/* Icon + Basic Info */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center shrink-0 ring-4 ring-primary-light/40">
          <IconHash size={28} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="h4 font-semibold">{channel.name}</h4>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                channel.type === "PUBLIC"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-orange-50 text-orange-600"
              }`}
            >
              {channel.type === "PUBLIC" ? "Público" : "Privado"}
            </span>
          </div>
          <p className="p-muted mt-0.5">{channel.description}</p>
          <p className="small-muted mt-0.5">ID: {channel.id}</p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconUser size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Creador</p>
            <p className="text-sm font-medium">{channel.creator.username}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconCalendar size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Fecha de creación</p>
            <p className="text-sm font-medium">{formatDate(channel.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconClock size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Última actividad</p>
            <p className="text-sm font-medium">{formatDate(channel.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-light">
        <button
          onClick={() => handleAction("Editar")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-light text-sm font-medium hover:bg-silver-light transition-colors"
        >
          <IconEdit size={16} />
          Editar
        </button>
        <button
          onClick={() => handleAction("Archivar")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-error text-error text-sm font-medium hover:bg-error hover:text-white transition-colors"
        >
          <IconTrash size={16} />
          Archivar
        </button>
      </div>
    </div>
  );
}
