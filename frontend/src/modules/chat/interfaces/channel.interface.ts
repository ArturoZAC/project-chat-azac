import type { User } from "@/modules/auth/interfaces/user.interface";

export type ChannelType = "PUBLIC" | "PRIVATE";
export type ChannelMemberRole = "OWNER" | "MEMBER" | "GUEST";

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  owner: Pick<User, "id" | "username">;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  id: string;
  user: Pick<User, "id" | "username" | "email" | "avatarUrl" | "isOnline">;
  role: ChannelMemberRole;
  joinedAt: string;
}
