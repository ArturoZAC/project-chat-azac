"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconX, IconAlertTriangle, IconInfoCircle, IconCircleCheck } from "@tabler/icons-react";
import { type Toast as ToastType, useToastStore } from "@/store/toast.store";

const CONFIG = {
  success: {
    icon: IconCircleCheck,
    bar: "#4CCC43",
    iconBg: "#F0F0F0",
    iconColor: "#4CCC43",
  },
  error: {
    icon: IconX,
    bar: "#EF4444",
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
  },
  warn: {
    icon: IconAlertTriangle,
    bar: "#F2D929",
    iconBg: "#FAEB93",
    iconColor: "#C7AE20",
  },
  info: {
    icon: IconInfoCircle,
    bar: "#C4B5FD",
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
  },
};

interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;
  const duration = toast.duration ?? 4000;

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = "0%";
    });
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="relative w-[340px] overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
    >
      {/* barra lateral — color dinámico, necesita style */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[10px]"
        style={{ background: cfg.bar }}
      />

      <div className="flex items-start gap-3 pl-5 pr-3.5 py-3.5">
        {/* icono — bg y color dinámicos, necesita style */}
        <div
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg"
          style={{ background: cfg.iconBg }}
        >
          <Icon size={18} color={cfg.iconColor} strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-heading text-[13px] font-semibold leading-tight text-[#111111] m-0">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280] m-0">{toast.message}</p>
          )}
        </div>

        <button
          onClick={() => removeToast(toast.id)}
          className="shrink-0 rounded-md p-1 text-[#9CA3AF] transition-colors duration-150 hover:text-[#6B7280] cursor-pointer border-none bg-transparent"
        >
          <IconX size={15} strokeWidth={2} />
        </button>
      </div>

      {/* barra de progreso */}
      <div className="h-[3px] bg-[#F3F4F6] overflow-hidden">
        <div ref={barRef} className="h-full w-full opacity-50" style={{ background: cfg.bar }} />
      </div>
    </motion.div>
  );
}
