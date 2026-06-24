import { create } from "zustand";
import type { User } from "@/modules/auth/interfaces/user.interface";

interface AuthStore {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  registeredEmail: string | null;

  setSession: (userId: string) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setRegisteredEmail: (email: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userId: null,
  isAuthenticated: false,
  registeredEmail: null,

  setSession: (userId) => set({ userId, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clearSession: () => set({ user: null, userId: null, isAuthenticated: false }),
  setRegisteredEmail: (email) => set({ registeredEmail: email }),
}));
