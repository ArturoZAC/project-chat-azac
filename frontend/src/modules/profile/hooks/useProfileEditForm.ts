"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import { updateProfileAction } from "@/modules/profile/actions/update-profile.action";

export function useProfileEditForm() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;

    if (newPassword && newPassword !== confirmPassword) {
      toastError("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    const hasChanges =
      username !== currentUser.username ||
      email !== currentUser.email ||
      !!newPassword;

    if (!hasChanges) {
      toastError("Error", "No has realizado ningún cambio");
      return;
    }

    setIsSaving(true);

    const result = await updateProfileAction(currentUser.id, {
      username: username !== currentUser.username ? username : undefined,
      email: email !== currentUser.email ? email : undefined,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    setIsSaving(false);

    if (!result.success) {
      toastError("Error", result.message ?? "Error al actualizar perfil");
      return;
    }

    setUser({ ...currentUser, username, email });
    toastSuccess("Perfil actualizado", "Los cambios se guardaron correctamente");
    router.push("/profile");
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  return {
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
  };
}
