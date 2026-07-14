"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconLock, IconLockOpen } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/shared/ui/Switch";
import { createChannelAction } from "@/shared/actions/create-channel.action";
import { useToastStore } from "@/store/toast.store";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const queryClient = useQueryClient();
  const success = useToastStore((s) => s.success);
  const error = useToastStore((s) => s.error);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setIsPrivate(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const result = await createChannelAction({
      name: name.trim(),
      description: description.trim() || null,
      isPrivate,
    });

    if (result.success) {
      success("Canal creado", `El canal "${name}" fue creado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ["admin", "channels"] });
      onClose();
    } else {
      error("Error", result.message || "No se pudo crear el canal");
    }

    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h4 className="h4 font-semibold">Crear canal</h4>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre del canal</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: backend, diseño, etc."
                  className="w-full px-3 py-2 rounded-lg border border-gray-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Descripción <span className="small-muted">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el propósito del canal..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Private toggle — Switch */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Tipo de canal</label>
                <div className="flex items-center justify-between rounded-lg border border-gray-light px-4 py-3">
                  <div className="flex items-center gap-3">
                    {isPrivate ? (
                      <IconLock size={18} className="text-orange-500" />
                    ) : (
                      <IconLockOpen size={18} className="text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {isPrivate ? "Privado" : "Público"}
                      </p>
                      <p className="small-muted">
                        {isPrivate
                          ? "Solo con invitación se puede unir"
                          : "Cualquier miembro puede unirse"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isPrivate} onChange={setIsPrivate} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-light">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-light text-sm font-medium text-gray-dark hover:bg-silver-light transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando..." : "Crear"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
