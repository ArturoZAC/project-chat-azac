"use client";

import { useRouter } from "next/navigation";
import { IconMail, IconCalendar, IconClock, IconCircleCheck, IconEdit } from "@tabler/icons-react";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";

export function ProfilePageClient() {
  const router = useRouter();
  const currentUser = mockUsers.find((user) => user.id === currentUserId)!;

  const initials = getInitials(currentUser.username);
  const joinDate = new Date(currentUser.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lastAccess = currentUser.lastSeenAt
    ? new Date(currentUser.lastSeenAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Ahora";

  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto bg-gray-ultra">
      <div className="max-w-lg w-full px-6 py-10">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-light mb-4">
              <span className="p-white text-2xl font-bold">{initials}</span>
            </div>
            <h4 className="font-semibold text-center">{currentUser.username}</h4>
            <p className="p-muted text-center mt-0.5">{currentUser.email}</p>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold mt-2">
              {currentUser.role}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-ultra">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <IconCalendar size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="small-muted">Fecha de ingreso</p>
                <p className="text-sm font-medium">{joinDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-ultra">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <IconClock size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="small-muted">Último acceso</p>
                <p className="text-sm font-medium">{lastAccess}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-ultra sm:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <IconCircleCheck size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="small-muted">Verificación de cuenta</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <IconCircleCheck size={16} className="text-green-500" />
                  <p className="text-sm font-medium text-green-600">
                    {currentUser.isEmailVerified ? "Correo verificado" : "No verificado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
          >
            <IconEdit size={18} className="text-white" />
            <span className="btn-sans text-sm font-medium span-white">Editar perfil</span>
          </button>
        </div>

        {/* Footer phrase */}
        <p className="p-muted text-sm text-center mt-6 italic">
          &ldquo;La comunicación es el puente entre las ideas y la realidad.&rdquo;
        </p>
      </div>
    </div>
  );
}
