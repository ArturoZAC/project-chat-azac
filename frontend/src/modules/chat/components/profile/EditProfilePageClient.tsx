"use client";

import { IconArrowLeft, IconEye, IconEyeOff } from "@tabler/icons-react";
import { getInitials } from "@/shared/helpers/get-initials";
import { useProfileEditForm } from "@/modules/profile/hooks/useProfileEditForm";

export function EditProfilePageClient() {
  const {
    currentUser,
    username,
    setUsername,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isSaving,
    handleSave,
    handleCancel,
  } = useProfileEditForm();

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

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

          {/* Avatar (visual only) */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-light mb-3">
              <span className="p-white text-2xl font-bold">{initials}</span>
            </div>
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
                minLength={3}
                maxLength={30}
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-light my-2" />

            {/* Current password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Contraseña actual{" "}
                <span className="text-gray-mid font-normal">
                  (obligatorio para cambiar contraseña)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver-dark hover:text-gray-dark transition-colors"
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nueva contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>

            {/* Confirm new password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirmar nueva contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white hover:border-gray-mid"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-lg border border-gray-light text-sm font-medium text-gray-dark hover:bg-silver-light transition-all duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="span-white">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
