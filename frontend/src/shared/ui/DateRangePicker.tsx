"use client";

import { memo, useCallback, useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCalendarSearch,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDateRangeStore } from "@/store/date-range.store";
import "react-day-picker/style.css";

function DateRangePickerInner() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ─── Store ────────────────────────────────────────
  const range = useDateRangeStore((state) => state.range);
  const setRange = useDateRangeStore((state) => state.setRange);

  // ─── Click fuera ──────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers memoizados ──────────────────────────
  const handleSelect = useCallback(
    (selected: DateRange | undefined) => {
      setRange(selected);
      if (selected?.from && selected?.to) {
        setTimeout(() => setIsOpen(false), 400);
      }
    },
    [setRange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Bug #1: pasar undefined limpia TODOS los modifiers del DayPicker,
      // a diferencia de { from: undefined, to: undefined } que dejaba
      // estado residual (outline en días previamente seleccionados)
      useDateRangeStore.getState().clearRange();
    },
    [],
  );

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  // ─── Derived ──────────────────────────────────────
  const hasSelection = !!range?.from && !!range?.to;

  const triggerLabel = hasSelection
    ? `${format(range.from!, "d MMM", { locale: es })} — ${format(range.to!, "d MMM yyyy", { locale: es })}`
    : "Seleccionar rango";

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center justify-start gap-2 rounded-lg border border-gray-light bg-white px-3 py-2 text-sm font-normal text-gray-dark transition-all hover:bg-silver-light hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <IconCalendarSearch size={16} className="shrink-0 text-silver-dark" />
        <span
          className={
            hasSelection ? "text-gray-dark" : "text-silver-dark"
          }
        >
          {triggerLabel}
        </span>
        {hasSelection && (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleClear}
            className="ml-auto flex size-4 items-center justify-center rounded hover:bg-silver-mid/50 transition-colors"
          >
            <IconX size={12} className="text-silver-dark" />
          </span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-1.5 w-auto rounded-xl border border-gray-light bg-white p-2 shadow-lg"
          >
            {/*
              navLayout="around" → flechas a los costados de CADA caption:
                < julio 2026 >    < agosto 2026 >
              pagedNavigation → ambos meses cambian juntos
              z-20 en las flechas para que sean siempre clickeables
            */}
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={2}
              pagedNavigation
              navLayout="around"
              showOutsideDays
              locale={es}
              className="!m-0"
              classNames={{
                // ─── MONTHS: gap entre los 2 calendarios ──
                months: "!flex !gap-8",
                month: "!m-0",

                // ─── HEADER ────────────────────────────
                // navLayout="around" centra el caption y pone las
                // flechas a los costados con position:absolute
                month_caption:
                  "!flex !flex-row !items-center !justify-center !px-1 !py-1 !text-sm !font-semibold !text-gray-dark !relative",

                caption_label:
                  "!text-sm !font-semibold !text-gray-dark !leading-none",

                // Nav sin position relative (dejamos que around lo maneje)
                nav: "!flex !items-center",
                button_next:
                  "!flex !size-6 !items-center !justify-center !rounded-md !text-silver-dark hover:!bg-silver-light hover:!text-gray-dark !transition-colors !absolute !right-0 !top-0 !z-20",
                button_previous:
                  "!flex !size-6 !items-center !justify-center !rounded-md !text-silver-dark hover:!bg-silver-light hover:!text-gray-dark !transition-colors !absolute !left-0 !top-0 !z-20",

                // ─── GRID ──────────────────────────────
                // border-separate + border-spacing da gap entre celdas
                // (sin esto los números quedan pegados entre sí)
                month_grid:
                  "!p-0 !border-separate !border-spacing-1",
                weeks: "",
                weekdays:
                  "!text-[11px] !font-semibold !text-silver-dark !uppercase !tracking-wide",
                // weekday y day con mismo w/h para consistencia
                weekday: "!w-9 !h-9 !m-0 !text-center",

                // ─── DÍA ────────────────────────────────
                week: "!m-0",
                day: "!m-0 !w-9 !h-9 !p-0 !text-sm !transition-colors",
                day_button:
                  "!flex !size-full !items-center !justify-center !rounded-lg !text-sm !transition-colors hover:!bg-silver-light",

                // ─── RANGO ─────────────────────────────
                selected: "!font-medium",
                range_middle:
                  "!bg-primary/20 !text-gray-dark !rounded-none",
                range_start: "!rounded-full !bg-primary !text-white",
                range_end: "!rounded-full !bg-primary !text-white",

                // ─── FLAGS ─────────────────────────────
                today: "!font-semibold",
                outside: "!text-gray-mid !opacity-60",
                disabled: "!opacity-30 !cursor-not-allowed",
              }}
              components={{
                Chevron: (props) =>
                  props.orientation === "left" ? (
                    <IconChevronLeft size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  ),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const DateRangePicker = memo(DateRangePickerInner);
