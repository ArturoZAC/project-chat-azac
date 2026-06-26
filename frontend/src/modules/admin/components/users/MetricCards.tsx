"use client";

import { IconUsers, IconShield, IconCircleCheck } from "@tabler/icons-react";

interface MetricCardsProps {
  totalUsers: number;
  adminCount: number;
  onlineCount: number;
}

const cards = [
  {
    label: "Total usuarios",
    icon: IconUsers,
    getValue: (props: MetricCardsProps) => props.totalUsers,
  },
  {
    label: "Administradores",
    icon: IconShield,
    getValue: (props: MetricCardsProps) => props.adminCount,
  },
  {
    label: "En línea",
    icon: IconCircleCheck,
    getValue: (props: MetricCardsProps) => props.onlineCount,
  },
];

export function MetricCards(props: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
