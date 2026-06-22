"use client";

import { motion } from "framer-motion";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Hoy";
  if (target.getTime() === yesterday.getTime()) return "Ayer";

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 my-4 px-4"
    >
      <div className="flex-1 h-px bg-silver-mid" />
      <span className="small-muted font-medium shrink-0">{formatDateLabel(date)}</span>
      <div className="flex-1 h-px bg-silver-mid" />
    </motion.div>
  );
}
