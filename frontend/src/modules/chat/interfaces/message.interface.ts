import type { User } from "@/modules/auth/interfaces/user.interface";
import type { Channel } from "@/modules/chat/interfaces/channels/channel.interface";

export interface Message {
  id: string;
  content: string;
  author: Pick<User, "id" | "username" | "avatarUrl">;
  channel: Pick<Channel, "id" | "name">;
  replyTo?: string | null;
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string | null;
  isSystem?: boolean;
}
