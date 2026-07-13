"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconMail,
  IconLock,
  IconCircleCheck,
  IconBell,
  IconMusic,
  IconLogout,
} from "@tabler/icons-react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useLogout } from "@/modules/auth/hooks/useLogout";

export function SettingsPageClient() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const handleLogout = useLogout();

  const [notifications, setNotifications] = useState({
    messages: true,
    sounds: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto bg-gray-ultra">
      <div className="max-w-2xl w-full px-6 py-10 my-auto">
        {/* Back */}
        <button
          onClick={() => router.push("/messages")}
          className="flex items-center gap-1.5 text-sm text-gray-dark hover:text-black transition-colors mb-6"
        >
          <IconArrowLeft size={16} />
          <span>Volver a mensajes</span>
        </button>

        <h4 className="font-semibold mb-6">Configuración</h4>

        <div className="flex flex-col gap-4">
          {/* Account Section */}
          <section className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
            <h6 className="font-semibold text-sm mb-4">Cuenta</h6>

            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <IconMail size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{currentUser?.email ?? "—"}</p>
                    <p className="small-muted">Correo electrónico</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-gray-light text-sm font-medium text-gray-dark hover:bg-silver-light transition-colors shrink-0">
                  Cambiar
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <IconLock size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">********</p>
                    <p className="small-muted">Contraseña</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-gray-light text-sm font-medium text-gray-dark hover:bg-silver-light transition-colors shrink-0">
                  Cambiar
                </button>
              </div>

              {/* Verification */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <IconCircleCheck size={16} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <IconCircleCheck size={14} className="text-green-500" />
                    <p className="text-sm font-medium text-green-600">Verificado</p>
                  </div>
                  <p className="small-muted">Tu correo electrónico está verificado</p>
                </div>
              </div>
            </div>
          </section>

          {/* Session Section */}
          <section className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
            <h6 className="font-semibold text-sm mb-4">Sesión</h6>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-error text-error hover:bg-error hover:text-white transition-all duration-200 text-sm font-medium"
            >
              <IconLogout size={18} />
              Cerrar sesión
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
