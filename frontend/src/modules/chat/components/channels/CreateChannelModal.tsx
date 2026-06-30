"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconHash } from "@tabler/icons-react";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useChannelMutations } from "@/modules/chat/hooks/channels/useChannelMutations";
import { createChannelSchema, type CreateChannelInput } from "@/modules/chat/schemas/chat.schema";

export function CreateChannelModal() {
  const { isCreateModalOpen, setCreateModalOpen } = useChatStore();
  const { createChannelMutation } = useChannelMutations();

  const [form, setForm] = useState<CreateChannelInput>({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChannelInput, string>>>({});

  const handleChange = (field: keyof CreateChannelInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = createChannelSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreateChannelInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof CreateChannelInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    createChannelMutation.mutate(result.data);
    setForm({ name: "", description: "", isPrivate: false });
  };

  const handleClose = () => {
    setCreateModalOpen(false);
    setForm({ name: "", description: "", isPrivate: false });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h6 className="font-semibold">Crear canal</h6>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="label font-medium mb-1.5 block">Nombre del canal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-dark">
                    <IconHash size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="ej. desarrollo"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                {errors.name && <p className="small text-error mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label font-medium mb-1.5 block">
                  Descripción <small className="text-gray-mid">(opcional)</small>
                </label>
                <textarea
                  placeholder="¿Para qué será este canal?"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
                {errors.description && <p className="small text-error mt-1">{errors.description}</p>}
              </div>

              {/* Private toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isPrivate}
                    onChange={(e) => handleChange("isPrivate", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-light rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <div>
                  <span className="text-sm font-medium">Canal privado</span>
                  <p className="small-muted">Solo visible para miembros invitados</p>
                </div>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={createChannelMutation.isPending}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-1"
              >
                {createChannelMutation.isPending ? "Creando..." : "Crear canal"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
