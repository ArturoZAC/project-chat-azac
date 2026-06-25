"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPhoto, IconArrowLeft } from "@tabler/icons-react";
import { mockUsers, currentUserId, getInitials } from "@/modules/chat/lib/mock-data";

export function EditProfilePageClient() {
  const router = useRouter();
  const currentUser = mockUsers.find((user) => user.id === currentUserId)!;

  const [username, setUsername] = useState(currentUser.username);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl ?? "");

  const handleSave = () => {
    // Mock: would call API to update profile
    console.log("Save profile:", { username, avatarUrl });
    router.push("/profile");
  };

  const handleCancel = () => {
    router.push("/messages");
  };

  const initials = getInitials(currentUser.username);

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto bg-gray-ultra">
      <div className="max-w-2xl w-full px-6 py-10 my-auto">
        {/* Header */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-sm text-gray-dark hover:text-black transition-colors mb-6"
        >
          <IconArrowLeft size={16} />
          <span>Volver a mensajes</span>
        </button>

        {/* Edit Card */}
        <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-8">
          <h4 className="font-semibold mb-6">Editar perfil</h4>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-light">
                <span className="p-white text-2xl font-bold">{initials}</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-light shadow-sm flex items-center justify-center hover:bg-silver-light transition-colors">
                <IconPhoto size={14} className="text-silver-dark" />
              </button>
            </div>
            <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Cambiar foto
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL del Avatar</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/avatar.jpg"
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-lg border border-gray-light text-sm font-medium text-gray-dark hover:bg-silver-light transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
            >
              <span className="span-white">Guardar cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
