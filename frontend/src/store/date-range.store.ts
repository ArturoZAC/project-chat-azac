import { create } from "zustand";
import type { DateRange } from "react-day-picker";

function defaultRange(): DateRange {
  const today = new Date();
  return { from: today, to: today };
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
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
