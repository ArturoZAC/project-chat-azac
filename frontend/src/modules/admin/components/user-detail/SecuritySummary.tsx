"use client";

import { IconCircleCheck, IconX, IconShield } from "@tabler/icons-react";
import type { AdminUser } from "@/modules/admin/interfaces/admin.interface";

interface SecuritySummaryProps {
  user: AdminUser;
}

export function SecuritySummary({ user }: SecuritySummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      <h5 className="h5 font-semibold mb-4">Seguridad</h5>

      <div className="flex flex-col gap-4">
        {/* Email verification */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user.isEmailVerified ? "bg-green-50" : "bg-silver-light"
              }`}
            >
              {user.isEmailVerified ? (
                <IconCircleCheck size={18} className="text-green-500" />
              ) : (
                <IconX size={18} className="text-silver-dark" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Verificación de email</p>
              <p className="small-muted">
                {user.isEmailVerified ? "Verificado" : "No verificado"}
              </p>
            </div>
          </div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              user.isEmailVerified
                ? "bg-green-50 text-green-600"
                : "bg-silver-light text-silver-dark"
            }`}
          >
            {user.isEmailVerified ? "Verificado" : "Pendiente"}
          </span>
        </div>

        {/* 2FA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user.twoFactorEnabled ? "bg-green-50" : "bg-silver-light"
              }`}
            >
              <IconShield
                size={18}
                className={
                  user.twoFactorEnabled ? "text-green-500" : "text-silver-dark"
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">Autenticación 2FA</p>
              <p className="small-muted">
                {user.twoFactorEnabled ? "Activado" : "Desactivado"}
              </p>
            </div>
          </div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              user.twoFactorEnabled
                ? "bg-green-50 text-green-600"
                : "bg-silver-light text-silver-dark"
            }`}
          >
            {user.twoFactorEnabled ? "Activado" : "Desactivado"}
          </span>
        </div>
      </div>
    </div>
  );
}
