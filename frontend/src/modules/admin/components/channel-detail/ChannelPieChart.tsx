"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IconMoodSad } from "@tabler/icons-react";
import type { ChannelMessageDistribution } from "@/modules/admin/lib/mock-admin-data";

interface ChannelPieChartProps {
  data: ChannelMessageDistribution[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChannelMessageDistribution & { totalMessages: number };
  }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  const total = entry.payload.totalMessages;
  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-xl border border-gray-light shadow-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.payload.color }}
        />
        <span className="text-sm font-semibold">{entry.name}</span>
      </div>
      <p className="text-sm text-gray-dark">
        {entry.value} mensajes <span className="text-silver-dark">({percentage}%)</span>
      </p>
    </div>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-dark">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ChannelPieChart({ data }: ChannelPieChartProps) {
  const totalMessages = data.reduce((sum, d) => sum + d.messages, 0);
  const hasData = data.length > 1 || (data.length === 1 && data[0].messages > 0);

  const chartData = data.map((entry) => ({
    ...entry,
    totalMessages,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="h5 font-semibold">Mensajes por miembro</h5>
        <p className="small-muted">
          {totalMessages} mensajes en total
        </p>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="messages"
              nameKey="authorName"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.authorId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
            <IconMoodSad size={20} className="text-silver-dark" />
          </div>
          <p className="p-muted">No hay mensajes en este canal</p>
        </div>
      )}
    </div>
  );
}
