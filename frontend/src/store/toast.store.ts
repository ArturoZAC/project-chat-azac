import { create } from "zustand";

export type ToastType = "success" | "error" | "warn" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warn: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID();
    // console.log({ id });
    const duration = toast.duration ?? 4000;

    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    setTimeout(() => get().removeToast(id), duration);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  success: (title, message, duration) =>
    get().addToast({ type: "success", title, message, duration }),

  error: (title, message, duration) => get().addToast({ type: "error", title, message, duration }),

  warn: (title, message, duration) => get().addToast({ type: "warn", title, message, duration }),

  info: (title, message, duration) => get().addToast({ type: "info", title, message, duration }),
}));
