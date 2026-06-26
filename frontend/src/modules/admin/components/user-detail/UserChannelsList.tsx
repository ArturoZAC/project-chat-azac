"use client";

import { IconHash, IconMoodSad } from "@tabler/icons-react";

interface UserChannel {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER" | "GUEST";
}

interface UserChannelsListProps {
  channels: UserChannel[];
}

export function UserChannelsList({ channels }: UserChannelsListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
      <h5 className="h5 font-semibold mb-4">Canales donde participa</h5>

      {channels.length > 0 ? (
        <div className="flex flex-col gap-2">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-silver-light/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-silver-light flex items-center justify-center shrink-0">
                <IconHash size={16} className="text-silver-dark" />
              </div>
              <span className="text-sm font-medium flex-1">{ch.name}</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  ch.role === "OWNER"
                    ? "bg-primary-light text-primary"
                    : "bg-silver-light text-gray-dark"
                }`}
              >
                {ch.role === "OWNER" ? "Propietario" : "Miembro"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
            <IconMoodSad size={20} className="text-silver-dark" />
          </div>
          <p className="p-muted">No participa en ningún canal</p>
        </div>
      )}
    </div>
  );
}
