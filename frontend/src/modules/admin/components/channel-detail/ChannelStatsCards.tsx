"use client";

import { IconMessage, IconUsers, IconUserCheck, IconActivity } from "@tabler/icons-react";

interface ChannelStatsCardsProps {
  totalMessages: number;
  membersCount: number;
  activeMembers: number;
  messagesThisWeek: number;
}

const cards = [
  {
    label: "Total mensajes",
    icon: IconMessage,
    getValue: (props: ChannelStatsCardsProps) => props.totalMessages,
  },
  {
    label: "Miembros",
    icon: IconUsers,
    getValue: (props: ChannelStatsCardsProps) => props.membersCount,
  },
  {
    label: "Miembros activos",
    icon: IconUserCheck,
    getValue: (props: ChannelStatsCardsProps) => props.activeMembers,
  },
  {
    label: "Mensajes esta semana",
    icon: IconActivity,
    getValue: (props: ChannelStatsCardsProps) => props.messagesThisWeek,
  },
];

export function ChannelStatsCards(props: ChannelStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-light p-5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-3">
              <Icon size={20} className="text-primary" />
            </div>
            <p className="h3 font-bold">{card.getValue(props)}</p>
            <p className="small-muted">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
