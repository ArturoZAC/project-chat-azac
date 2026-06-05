import type { User } from "./user.interface";
import type { Channel } from "./channel.interface";

export interface Message {
  id: string;
  content: string;
  author: Pick<User, "id" | "username" | "avatarUrl">;
  channel: Pick<Channel, "id" | "name">;
  replyTo?: string | null;
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
  updatedAt: string;
}
