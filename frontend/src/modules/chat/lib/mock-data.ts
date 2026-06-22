import type { Channel, ChannelMember } from "@/shared/interfaces/channel.interface";
import type { Message } from "@/shared/interfaces/message.interface";
import type { User } from "@/shared/interfaces/user.interface";

// ─── Mock Users ──────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: "u1",
    username: "Lucía",
    email: "lucia@test.com",
    avatarUrl: null,
    role: "USER",
    isOnline: true,
    isEmailVerified: true,
    lastSeenAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u2",
    username: "Juan",
    email: "juan@test.com",
    avatarUrl: null,
    role: "USER",
    isOnline: true,
    isEmailVerified: true,
    lastSeenAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u3",
    username: "Pedro",
    email: "pedro@test.com",
    avatarUrl: null,
    role: "USER",
    isOnline: false,
    isEmailVerified: true,
    lastSeenAt: "2026-06-20T15:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-20T15:00:00Z",
  },
  {
    id: "u4",
    username: "Ana",
    email: "ana@test.com",
    avatarUrl: null,
    role: "USER",
    isOnline: true,
    isEmailVerified: true,
    lastSeenAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "me",
    username: "Artur",
    email: "artur@test.com",
    avatarUrl: null,
    role: "ADMIN",
    isOnline: true,
    isEmailVerified: true,
    lastSeenAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export const currentUserId = "me";

// ─── Mock Channels ───────────────────────────────────────────
export const mockChannels: Channel[] = [
  {
    id: "ch1",
    name: "General",
    description: "Chat general del equipo. Para temas importantes y anuncios.",
    type: "PUBLIC",
    owner: { id: "u1", username: "Lucía" },
    membersCount: 24,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-21T00:00:00Z",
  },
  {
    id: "ch2",
    name: "Diseño",
    description: "Discusiones de diseño UI/UX, feedback y brainstorming.",
    type: "PUBLIC",
    owner: { id: "u2", username: "Juan" },
    membersCount: 12,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-21T00:00:00Z",
  },
  {
    id: "ch3",
    name: "Desarrollo",
    description: "Código, PRs, bugs y arquitectura técnica.",
    type: "PUBLIC",
    owner: { id: "u4", username: "Ana" },
    membersCount: 18,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-21T00:00:00Z",
  },
  {
    id: "ch4",
    name: "Random",
    description: "Off-topic, memes y charla casual.",
    type: "PUBLIC",
    owner: { id: "u1", username: "Lucía" },
    membersCount: 30,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-21T00:00:00Z",
  },
  {
    id: "ch5",
    name: "Marketing",
    description: "Estrategia de contenido, campañas y métricas.",
    type: "PRIVATE",
    owner: { id: "u2", username: "Juan" },
    membersCount: 6,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-21T00:00:00Z",
  },
];

// ─── Memberships (which channels the current user belongs to) ─
export const mockMemberships = ["ch1", "ch2", "ch4"];

// ─── Mock Members per channel ────────────────────────────────
export const mockMembers: Record<string, ChannelMember[]> = {
  ch1: [
    { id: "m1", user: { id: "u1", username: "Lucía", email: "lucia@test.com", avatarUrl: null, isOnline: true }, role: "OWNER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m2", user: { id: "u2", username: "Juan", email: "juan@test.com", avatarUrl: null, isOnline: true }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m3", user: { id: "u3", username: "Pedro", email: "pedro@test.com", avatarUrl: null, isOnline: false }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m4", user: { id: "u4", username: "Ana", email: "ana@test.com", avatarUrl: null, isOnline: true }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m5", user: { id: "me", username: "Artur", email: "artur@test.com", avatarUrl: null, isOnline: true }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
  ],
  ch2: [
    { id: "m6", user: { id: "u2", username: "Juan", email: "juan@test.com", avatarUrl: null, isOnline: true }, role: "OWNER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m7", user: { id: "me", username: "Artur", email: "artur@test.com", avatarUrl: null, isOnline: true }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
  ],
  ch4: [
    { id: "m8", user: { id: "u1", username: "Lucía", email: "lucia@test.com", avatarUrl: null, isOnline: true }, role: "OWNER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m9", user: { id: "me", username: "Artur", email: "artur@test.com", avatarUrl: null, isOnline: true }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "m10", user: { id: "u3", username: "Pedro", email: "pedro@test.com", avatarUrl: null, isOnline: false }, role: "MEMBER", joinedAt: "2026-01-01T00:00:00Z" },
  ],
};

// ─── Mock Messages per channel ───────────────────────────────
export const mockMessages: Record<string, Message[]> = {
  ch1: [
    {
      id: "msg1",
      content: "¡Buenos días equipo! Hoy tenemos reunión a las 11am.",
      author: { id: "u1", username: "Lucía", avatarUrl: null },
      channel: { id: "ch1", name: "General" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-21T09:00:00Z",
      updatedAt: "2026-06-21T09:00:00Z",
    },
    {
      id: "msg2",
      content: "Perfecto, voy a preparar la presentación.",
      author: { id: "me", username: "Artur", avatarUrl: null },
      channel: { id: "ch1", name: "General" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-21T09:05:00Z",
      updatedAt: "2026-06-21T09:05:00Z",
    },
    {
      id: "msg3",
      content: "Yo también estaré allí. ¿Comparto el enlace?",
      author: { id: "u2", username: "Juan", avatarUrl: null },
      channel: { id: "ch1", name: "General" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-21T09:10:00Z",
      updatedAt: "2026-06-21T09:10:00Z",
    },
    {
      id: "msg4",
      content: "Sí, porfa. Lo pongo en el calendario.",
      author: { id: "u1", username: "Lucía", avatarUrl: null },
      channel: { id: "ch1", name: "General" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-21T09:12:00Z",
      updatedAt: "2026-06-21T09:12:00Z",
    },
    {
      id: "msg5",
      content: "Listo, ya lo compartí en el canal.",
      author: { id: "u2", username: "Juan", avatarUrl: null },
      channel: { id: "ch1", name: "General" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-21T09:15:00Z",
      updatedAt: "2026-06-21T09:15:00Z",
    },
  ],
  ch2: [
    {
      id: "msg6",
      content: "¿Qué les parece este nuevo mockup para la landing?",
      author: { id: "u2", username: "Juan", avatarUrl: null },
      channel: { id: "ch2", name: "Diseño" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-20T14:00:00Z",
      updatedAt: "2026-06-20T14:00:00Z",
    },
    {
      id: "msg7",
      content: "Me gusta! Los colores están muy bien balanceados.",
      author: { id: "me", username: "Artur", avatarUrl: null },
      channel: { id: "ch2", name: "Diseño" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-20T14:30:00Z",
      updatedAt: "2026-06-20T14:30:00Z",
    },
    {
      id: "msg8",
      content: "Podríamos ajustar el padding del hero.",
      author: { id: "u4", username: "Ana", avatarUrl: null },
      channel: { id: "ch2", name: "Diseño" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-20T15:00:00Z",
      updatedAt: "2026-06-20T15:00:00Z",
    },
  ],
  ch4: [
    {
      id: "msg9",
      content: "Alguien juega Valorant después del trabajo?",
      author: { id: "u1", username: "Lucía", avatarUrl: null },
      channel: { id: "ch4", name: "Random" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-19T18:00:00Z",
      updatedAt: "2026-06-19T18:00:00Z",
    },
    {
      id: "msg10",
      content: "Yo! Te escribo luego.",
      author: { id: "me", username: "Artur", avatarUrl: null },
      channel: { id: "ch4", name: "Random" },
      replyTo: null,
      readBy: [],
      createdAt: "2026-06-19T18:15:00Z",
      updatedAt: "2026-06-19T18:15:00Z",
    },
  ],
};

// ─── Unread counts per channel ───────────────────────────────
export const mockUnreadCounts: Record<string, number> = {
  ch1: 3,
  ch2: 1,
  ch4: 0,
};

// ─── Helper: initials from username ──────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
