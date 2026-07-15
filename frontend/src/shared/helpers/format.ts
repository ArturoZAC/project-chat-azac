export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PIE_COLORS = [
  "#7c3aed",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#84cc16",
];
