"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconCopy, IconCheck, IconLink } from "@tabler/icons-react";

interface InviteLinkModalProps {
  isOpen: boolean;
  inviteUrl: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export function InviteLinkModal({
  isOpen,
  inviteUrl,
  isGenerating,
  onClose,
  onGenerate,
}: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={onClose}
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
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                  <IconLink size={18} className="text-primary" />
                </span>
                <div>
                  <h6 className="font-semibold">Enlace de invitación</h6>
                  <p className="small-muted">
                    Comparte este enlace para invitar miembros
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content */}
            {!inviteUrl ? (
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generando..." : "Generar enlace"}
              </button>
            ) : (
              <div>
                <div className="flex items-center gap-2 p-3 bg-silver-light rounded-lg mb-3">
                  <span className="text-sm text-gray-dark truncate flex-1">
                    {inviteUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white text-primary transition-colors shrink-0"
                  >
                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  </button>
                </div>
                <p className="small-muted text-center">
                  El enlace expira en 7 días
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
