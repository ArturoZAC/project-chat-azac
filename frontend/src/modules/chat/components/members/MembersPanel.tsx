"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconUsers, IconLink } from "@tabler/icons-react";
import type { ChannelMember } from "@/modules/chat/interfaces/channels/channel.interface";
import { getInitials } from "@/shared/helpers/get-initials";

interface MembersPanelProps {
  isOpen: boolean;
  members: ChannelMember[];
  onClose: () => void;
  onGenerateInvite?: () => void;
}

export function MembersPanel({ isOpen, members, onClose, onGenerateInvite }: MembersPanelProps) {
  const online = members.filter((m) => m.user.isOnline);
  const offline = members.filter((m) => !m.user.isOnline);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="border-l border-gray-light bg-white overflow-hidden shrink-0"
        >
          <div className="w-[240px] h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-light h-[71px]">
              <div className="flex items-center gap-2">
                <IconUsers size={18} className="text-silver-dark" />
                <span className="text-sm font-semibold">Miembros</span>
                <span className="small-muted">({members.length})</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-silver-light text-silver-dark transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Online */}
              {online.length > 0 && (
                <div className="mb-3">
                  <p className="small-muted uppercase tracking-wider font-semibold mb-1.5 px-1">
                    En línea — {online.length}
                  </p>
                  <div className="flex flex-col gap-1">
                    {online.map((member) => (
                      <MemberItem key={member.id} member={member} isOnline />
                    ))}
                  </div>
                </div>
              )}

              {/* Offline */}
              {offline.length > 0 && (
                <div>
                  <p className="small-muted uppercase tracking-wider font-semibold mb-1.5 px-1">
                    Desconectado — {offline.length}
                  </p>
                  <div className="flex flex-col gap-1">
                    {offline.map((member) => (
                      <MemberItem key={member.id} member={member} isOnline={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Invite link button */}
            {onGenerateInvite && (
              <div className="border-t border-gray-light p-3">
                <button
                  onClick={onGenerateInvite}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium transition-colors"
                >
                  <IconLink size={16} />
                  <span>Generar enlace de invitación</span>
                </button>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function MemberItem({ member, isOnline }: { member: ChannelMember; isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-silver-light transition-colors">
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-primary text-xs font-semibold">
            {getInitials(member.user.username)}
          </span>
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-light"
          }`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{member.user.username}</p>
        <p className="small-muted">{member.role === "OWNER" ? "Creador" : "Miembro"}</p>
      </div>
    </div>
  );
}
