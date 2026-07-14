"use client";

import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-gray-light"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ${
          checked ? "ml-[22px]" : "ml-[2px]"
        }`}
      />
    </button>
  );
}
