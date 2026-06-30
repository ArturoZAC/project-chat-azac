"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { restoreSessionAction } from "@/modules/auth/actions/restore-session.action";

export function SessionRestore({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  const restored = useRef(false);

  useEffect(() => {
    // Only run once on mount (prevents strict mode double call)
    if (restored.current) return;
    restored.current = true;

    // If already authenticated (e.g. just logged in), skip
    if (isAuthenticated) return;

    const restore = async () => {
      const result = await restoreSessionAction();

      if (result.success) {
        setSession(result.data.userId);
        setUser(result.data);
      } else {
        clearSession();
        router.push("/login");
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
