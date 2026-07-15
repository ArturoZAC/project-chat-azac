"use client";

import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { IconMoodSad } from "@tabler/icons-react";
import { DateRangePicker } from "@/shared/ui/DateRangePicker";
import { getActivityAction } from "@/shared/actions/get-activity.action";
import { useDateRangeStore } from "@/store/date-range.store";

const PIE_COLORS = [
  "#7c3aed",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f97316",
  "#6366f1",
];

const DAY_LABELS: Record<string, string> = {
  Mon: "Lun",
  Tue: "Mar",
  Wed: "Mié",
  Thu: "Jue",
  Fri: "Vie",
  Sat: "Sáb",
  Sun: "Dom",
};

const DAY_FULL: Record<string, string> = {
  Mon: "Lunes",
  Tue: "Martes",
  Wed: "Miércoles",
  Thu: "Jueves",
  Fri: "Viernes",
  Sat: "Sábado",
  Sun: "Domingo",
};

interface ActivityEntry {
  date: string;
  messages: number;
}

interface ActivityChartProps {
  userId: string;
}

// ─── HEADER MEMOIZADO ──────────────────────────────────
// NO se subscribe al store → NUNCA se re-renderiza al cambiar el rango.
const ActivityHeader = memo(function ActivityHeader() {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h5 className="subtitle2 font-semibold !text-base">Actividad</h5>
      <DateRangePicker />
    </div>
  );
});

// ─── CONTENIDO DINÁMICO ───────────────────────────────
// Se subscribe solo a dateFrom/dateTo del store.
function ActivityContent({ userId }: { userId: string }) {
  const dateFrom = useDateRangeStore((state) => state.dateFrom);
  const dateTo = useDateRangeStore((state) => state.dateTo);

  const { data: activityData, isLoading } = useQuery({
    queryKey: ["admin", "user", userId, "activity", dateFrom, dateTo],
    queryFn: () => getActivityAction(userId, dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  });

  const data: ActivityEntry[] = useMemo(() => {
    if (!activityData?.success || !activityData.data) return [];
    return activityData.data;
  }, [activityData]);

  const barData = useMemo(() => {
    return data.map((entry) => {
      const d = new Date(entry.date + "T00:00:00");
      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleDateString("es-ES", { month: "short" });
      return {
        label: `${day} ${month}`,
        messages: entry.messages,
        date: entry.date,
      };
    });
  }, [data]);

  const donutData = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const entry of data) {
      const d = new Date(entry.date + "T00:00:00");
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      groups[key] = (groups[key] || 0) + entry.messages;
    }
    return Object.entries(groups).map(([key, value]) => ({
      name: DAY_LABELS[key] || key,
      fullName: DAY_FULL[key] || key,
      messages: value,
    }));
  }, [data]);

  const hasData = data.length > 0 && data.some((d) => d.messages > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="w-9 h-9 rounded-lg bg-silver-light flex items-center justify-center">
          <IconMoodSad size={18} className="text-silver-dark" />
        </div>
        <p className="p-muted">No hay datos de actividad disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Chart 1: Barras por fecha */}
      <div className="min-w-0">
        <p className="small-muted mb-2">Mensajes por fecha</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={barData}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              formatter={(value) => [`${String(value)} mensajes`]}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="messages"
              fill="var(--color-primary, #7c3aed)"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Donut por día de la semana */}
      <div className="min-w-0">
        <p className="small-muted mb-2">
          Distribución por día de la semana
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={donutData}
              dataKey="messages"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={70}
              paddingAngle={2}
            >
              {donutData.map((_entry, index) => (
                <Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              offset={{ x: 12, y: 0 }}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              formatter={(value) => [`${String(value)} mensajes`]}
              labelFormatter={(label) => {
                const item = donutData.find((d) => d.name === label);
                return item?.fullName ?? label;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────
// El header (título + DateRangePicker) está en ActivityHeader (memoizado).
// El contenido (query + charts) está en ActivityContent.
// Al cambiar el rango, SOLO ActivityContent se re-renderiza.
export function ActivityChart({ userId }: ActivityChartProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-light shadow-sm p-5">
      <ActivityHeader />
      <ActivityContent userId={userId} />
    </div>
  );
}
