import { create } from "zustand";
import type { DateRange } from "react-day-picker";

function defaultRange(): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { from: today, to: today };
}

// Formatea en HORA LOCAL (no UTC) para que coincida con lo que muestra la UI
// y con la intención del usuario. Usar toISOString() (UTC) causaba un desfase
// de 1 día cerca de medianoche: la UI marcaba "14 jul" pero el query iba por el
// 15 (sin mensajes) y los charts quedaban vacíos en la carga inicial.
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DateRangeState {
  /** undefined = no hay selección (limpia los modifiers del DayPicker) */
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  clearRange: () => void;
  /** from como string YYYY-MM-DD (derivado) */
  dateFrom: string;
  /** to como string YYYY-MM-DD (derivado) */
  dateTo: string;
}

export const useDateRangeStore = create<DateRangeState>((set) => {
  const initial = defaultRange();
  return {
    range: initial,
    dateFrom: toDateString(initial.from!),
    dateTo: toDateString(initial.to!),
    setRange: (range) =>
      set({
        range,
        dateFrom: range?.from ? toDateString(range.from) : "",
        dateTo: range?.to ? toDateString(range.to) : "",
      }),
    clearRange: () =>
      set({
        range: undefined,
        dateFrom: "",
        dateTo: "",
      }),
  };
});
