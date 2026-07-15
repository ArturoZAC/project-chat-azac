"use client";

import {
  IconHash,
  IconCalendar,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";
import { formatDate } from "@/shared/helpers/format";

interface ChannelProfileCardProps {
  channel: ChannelBackend;
}

export function ChannelProfileCard({ channel }: ChannelProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6 h-full flex flex-col">
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
                channel.isPrivate
                  ? "bg-orange-50 text-orange-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {channel.isPrivate ? "Privado" : "Público"}
            </span>
          </div>
          <p className="p-muted mt-0.5">{channel.description}</p>
          <p className="small-muted mt-0.5">ID: {channel.id.split("-")[0]}</p>
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
            <p className="text-sm font-medium">
              {channel.creator?.username ?? "Desconocido"}
            </p>
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
    </div>
  );
}
