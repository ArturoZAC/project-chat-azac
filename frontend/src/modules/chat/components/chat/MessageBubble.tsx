"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { Message } from "@/modules/chat/interfaces/message.interface";
import { getInitials } from "@/shared/helpers/get-initials";
import { linkify } from "@/shared/helpers/linkify";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, isOwn, onEdit, onDelete }: MessageBubbleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Altura estimada del menú (editar/eliminar + confirmación) para decidir la dirección
  const MENU_HEIGHT_ESTIMATE = 160;

  // Al abrir, medimos el espacio hacia abajo: si no alcanza, abrimos hacia arriba.
  // Se mide ANTES de abrir para evitar parpadeo (sin doble render).
  const handleToggleMenu = () => {
    if (!isMenuOpen) {
      const el = buttonContainerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setOpenUp(window.innerHeight - rect.bottom < MENU_HEIGHT_ESTIMATE);
      }
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleEdit = () => {
    setIsMenuOpen(false);
    onEdit?.(message);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setIsMenuOpen(false);
    setShowDeleteConfirm(false);
    onDelete?.(message);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex gap-2.5 px-4 py-0.5 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOwn ? "bg-primary" : "bg-silver-dark"
          }`}
        >
          <span className="text-white text-xs font-semibold">
            {getInitials(message.author.username)}
          </span>
        </div>
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Author name (only for others) */}
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-dark mb-0.5 ml-1">
            {message.author.username}
          </span>
        )}

        <div className="relative group/bubble">
          <div
            className={`
              px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
              ${isOwn ? "bg-primary text-white rounded-br-md" : "bg-silver-light text-black rounded-bl-md"}
            `}
          >
            {linkify(message.content)}
          </div>

          {/* Action dots — only for own messages */}
          {isOwn && (onEdit || onDelete) && (
            <div
              ref={buttonContainerRef}
              className="absolute -top-1 -right-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
            >
              <button
                onClick={handleToggleMenu}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-light shadow-sm hover:bg-silver-light transition-colors"
                aria-label="Acciones del mensaje"
                aria-expanded={isMenuOpen}
              >
                <IconDotsVertical size={14} className="text-gray-dark" />
              </button>

              {/* Dropdown menu — se abre hacia abajo o hacia arriba según el espacio disponible */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className={`absolute right-0 z-50 w-44 bg-white rounded-lg border border-gray-light shadow-lg py-1 ${
                    openUp ? "bottom-7" : "top-7"
                  }`}
                >
                  {showDeleteConfirm ? (
                    <>
                      <p className="px-3 py-2 text-xs text-gray-dark font-medium">
                        ¿Eliminar mensaje?
                      </p>
                      <button
                        onClick={handleDeleteConfirm}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <IconTrash size={14} />
                        Sí, eliminar
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-dark hover:bg-silver-light transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {onEdit && (
                        <button
                          onClick={handleEdit}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-dark hover:bg-silver-light transition-colors"
                        >
                          <IconPencil size={14} />
                          Editar mensaje
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={handleDeleteClick}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <IconTrash size={14} />
                          Eliminar mensaje
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <span
          className={`flex items-center gap-1 text-[10px] text-gray-mid mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}
        >
          {formatTime(message.createdAt)}
          {message.isEdited && <span className="italic text-xs">· editado</span>}
        </span>
      </div>
    </motion.div>
  );
}
