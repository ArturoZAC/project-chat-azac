"use client";

import {
  IconCalendar,
  IconClock,
  IconActivity,
  IconEdit,
  IconAlertCircle,
  IconTrash,
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
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      {/* Avatar + Basic Info */}
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
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
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
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-light">
        <button
          onClick={() => handleAction("Editar")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-light text-sm font-medium hover:bg-silver-light transition-colors"
        >
          <IconEdit size={16} />
          Editar
        </button>
        <button
          onClick={() => handleAction("Suspender")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-light text-sm font-medium hover:bg-silver-light transition-colors"
        >
          <IconAlertCircle size={16} />
          Suspender
        </button>
        <button
          onClick={() => handleAction("Eliminar")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-error text-error text-sm font-medium hover:bg-error hover:text-white transition-colors"
        >
          <IconTrash size={16} />
          Eliminar
        </button>
      </div>
    </div>
  );
}
