"use client";

import { IconShield, IconStar, IconMoodSad } from "@tabler/icons-react";
import type { ChannelMemberBackend } from "@/shared/actions/get-channel-members.action";
import { getInitials } from "@/shared/helpers/format";

interface ChannelMembersTableProps {
  members: ChannelMemberBackend[];
}

function getRoleBadge(role: string) {
  if (role === "OWNER") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600">
        <IconStar size={11} />
        Owner
      </span>
    );
  }
  if (role === "MEMBER") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-silver-light text-gray-dark">
        <IconShield size={11} />
        Miembro
      </span>
    );
  }
  return null;
}

export function ChannelMembersTable({ members }: ChannelMembersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-light">
        <h5 className="h5 font-semibold">
          Miembros ({members.length})
        </h5>
      </div>

      {members.length > 0 ? (
        <div className="divide-y divide-gray-light">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-silver-light/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {getInitials(member.username)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{member.username}</p>
                <p className="small-muted">ID: {member.id.split("-")[0]}</p>
              </div>

              {/* Role Badge */}
              <div className="shrink-0">
                {getRoleBadge(member.role)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
            <IconMoodSad size={20} className="text-silver-dark" />
          </div>
          <p className="p-muted">No hay miembros en este canal</p>
        </div>
      )}
    </div>
  );
}
