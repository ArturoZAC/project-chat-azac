"use client";

import {
  IconCalendar,
  IconClock,
  IconActivity,
  IconTrash,
  IconCircleCheck,
  IconX,
} from "@tabler/icons-react";
import type { AdminUser } from "@/modules/admin/interfaces/admin.interface";
import {
  getInitials,
  formatDate,
  formatDateTime,
} from "@/modules/admin/lib/mock-admin-data";

interface UserProfileCardProps {
  user: AdminUser;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const handleAction = (action: string) => {
    console.log(`[MOCK] ${action} usuario:`, user.id);
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-light shadow-sm p-6 flex flex-col justify-between">
      {/* Avatar + Basic Info + Eliminar */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0 ring-4 ring-primary-light">
          <span className="p-white text-xl font-bold">
            {getInitials(user.username)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="h4 font-semibold">{user.username}</h4>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                user.role === "ADMIN"
                  ? "bg-primary-light text-primary"
                  : "bg-silver-light text-gray-dark"
              }`}
            >
              {user.role === "ADMIN" ? "Admin" : "Usuario"}
            </span>
          </div>
          <p className="p-muted mt-0.5">{user.email}</p>
          <p className="small-muted mt-0.5">ID: {user.id}</p>
        </div>
        {/* Eliminar — arriba a la derecha */}
        <button
          onClick={() => handleAction("Eliminar")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-error text-error text-sm font-medium hover:bg-error hover:text-white transition-colors shrink-0"
          title="Eliminar usuario"
        >
          <IconTrash size={16} />
          Eliminar
        </button>
      </div>

      {/* Metadata Grid: 4 items en una fila */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconCalendar size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Fecha de registro</p>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconClock size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Último acceso</p>
            <p className="text-sm font-medium">
              {formatDateTime(user.lastSeenAt)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <IconActivity size={18} className="text-primary" />
          </div>
          <div>
            <p className="small-muted">Estado</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.isOnline ? "bg-green-500" : "bg-gray-light"
                }`}
              />
              <span className="text-sm font-medium">
                {user.isOnline ? "En línea" : "Desconectado"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
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
            <p className="small-muted">Verificación de email</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-medium">
                {user.isEmailVerified ? "Verificado" : "No verificado"}
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  user.isEmailVerified
                    ? "bg-green-50 text-green-600"
                    : "bg-silver-light text-silver-dark"
                }`}
              >
                {user.isEmailVerified ? "Verificado" : "Pendiente"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
