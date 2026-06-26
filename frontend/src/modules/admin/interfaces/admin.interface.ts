import type { User } from "@/modules/auth/interfaces/user.interface";
import type { Channel, ChannelMemberRole } from "@/modules/chat/interfaces/channel.interface";

export interface AdminUser extends User {
  messageCount: number;
  lastActiveChannel: string | null;
  isSuspended: boolean;
  twoFactorEnabled: boolean;
}

export interface DayActivity {
  day: string;
  fullDay: string;
  messages: number;
}

export interface AdminChannel extends Channel {
  creator: { id: string; username: string };
  memberList: Array<{
    id: string;
    username: string;
    role: ChannelMemberRole;
  }>;
}
