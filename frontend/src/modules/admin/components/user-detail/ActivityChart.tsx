"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IconMoodSad } from "@tabler/icons-react";
import type { DayActivity } from "@/modules/admin/interfaces/admin.interface";

interface ActivityChartProps {
  data: DayActivity[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const hasActivity = data.some((d) => d.messages > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      <h5 className="h5 font-semibold mb-4">Actividad</h5>

      {hasActivity ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
              formatter={(value) => [`${String(value)} mensajes`, "Mensajes"]}
              labelFormatter={(label) => {
                const item = data.find((d) => d.day === label);
                return item?.fullDay ?? label;
              }}
            />
            <Bar
              dataKey="messages"
              fill="var(--color-primary, #7c3aed)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
            <IconMoodSad size={20} className="text-silver-dark" />
          </div>
          <p className="p-muted">No hay datos de actividad disponibles</p>
        </div>
      )}
    </div>
  );
}
