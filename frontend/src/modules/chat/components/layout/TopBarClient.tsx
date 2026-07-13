"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronRight, IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { getInitials } from "@/shared/helpers/get-initials";
import { mockAdminUsers, mockAdminChannels } from "@/modules/admin/lib/mock-admin-data";
import { NotificationBell } from "@/modules/chat/components/notifications/NotificationBell";

interface Breadcrumb {
  label: string;
  href?: string;
}

function useBreadcrumbs(pathname: string): Breadcrumb[] {
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) return [{ label: "Inicio" }];

    // /channels
    if (segments[0] === "channels" && segments.length === 1) {
      return [{ label: "Explorar" }];
    }

    // /channels/:slug
    if (segments[0] === "channels" && segments.length >= 2) {
      return [
        { label: "Canales", href: "/channels" },
        { label: decodeURIComponent(segments[1]) },
      ];
    }

    // /messages
    if (segments[0] === "messages") {
      return [{ label: "Mensajes" }];
    }

    // /admin/users
    if (segments[0] === "admin" && segments[1] === "users" && segments.length === 2) {
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Usuarios" },
      ];
    }

    // /admin/users/:userId
    if (segments[0] === "admin" && segments[1] === "users" && segments.length >= 3) {
      const userId = segments[2];
      // Try to find the username from mock data
      const user = mockAdminUsers.find((u) => u.id === userId);
      const label = user?.username ?? decodeURIComponent(userId);
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Usuarios", href: "/admin/users" },
        { label },
      ];
    }

    // /admin/channels
    if (segments[0] === "admin" && segments[1] === "channels" && segments.length === 2) {
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Canales" },
      ];
    }

    // /admin/channels/:channelId
    if (segments[0] === "admin" && segments[1] === "channels" && segments.length >= 3) {
      const channelId = segments[2];
      const channel = mockAdminChannels.find((ch) => ch.id === channelId);
      const label = channel?.name ?? decodeURIComponent(channelId);
      return [
        { label: "Administración", href: "/admin/users" },
        { label: "Canales", href: "/admin/channels" },
        { label },
      ];
    }

    return [{ label: "Inicio" }];
  }, [pathname]);
}

export function TopBarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = useBreadcrumbs(pathname);
  const currentUser = useAuthStore((s) => s.user);
  const handleLogout = useLogout();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    setShowUserMenu(false);
    await handleLogout();
  };

  return (
    <>
      {/* Breadcrumbs — left */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <IconChevronRight size={14} className="text-silver-dark shrink-0" />
            )}
            {crumb.href ? (
              <button
                onClick={() => router.push(crumb.href!)}
                className="text-sm text-silver-dark hover:text-gray-dark transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-sm font-semibold text-gray-dark truncate max-w-[200px]">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right side — bell + avatar */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* Avatar with dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center focus:outline-none"
            title="Menú de usuario"
          >
            <span className="p-white text-xs font-semibold">
              {getInitials(currentUser?.username ?? "?")}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute z-50 bg-white rounded-xl shadow-lg border border-gray-light py-1 min-w-[180px] top-full right-0 mt-2"
              >
                <div className="px-3 py-2 border-b border-gray-light">
                  <p className="text-sm font-semibold truncate">{currentUser?.username ?? "Usuario"}</p>
                  <p className="small-muted truncate">{currentUser?.email ?? ""}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-red-50 transition-colors rounded-lg"
                >
                  <IconLogout size={16} />
                  Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
