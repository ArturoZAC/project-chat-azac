export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  isOnline: boolean;
  isEmailVerified: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
