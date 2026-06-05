"use client";

import { AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toast.store";
import { Toast } from "./Toast";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-2.5 items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
