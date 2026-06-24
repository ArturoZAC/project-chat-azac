import type { Message } from "@/modules/chat/interfaces/message.interface";
import { mockMessages, mockUsers, currentUserId } from "./mock-data";

export interface DMConversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastActivity: string;
}

export const mockDMConversations: DMConversation[] = [
  {
    id: "dm1",
    participants: [currentUserId, "u1"], // Artur ↔ Lucía
    messages: [
      {
        id: "dm1-1",
        content: "Holaa, cómo vas? Terminaste el diseño?",
        author: { id: "u1", username: "Lucía", avatarUrl: null },
        channel: { id: "dm1", name: "Lucía" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-23T10:00:00Z",
        updatedAt: "2026-06-23T10:00:00Z",
      },
      {
        id: "dm1-2",
        content: "Si! Ya lo subí al canal de Diseño para que lo vean",
        author: { id: currentUserId, username: "Artur", avatarUrl: null },
        channel: { id: "dm1", name: "Lucía" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-23T10:05:00Z",
        updatedAt: "2026-06-23T10:05:00Z",
      },
      {
        id: "dm1-3",
        content: "Perfecto, ahora lo reviso. Gracias!",
        author: { id: "u1", username: "Lucía", avatarUrl: null },
        channel: { id: "dm1", name: "Lucía" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-23T10:10:00Z",
        updatedAt: "2026-06-23T10:10:00Z",
      },
    ],
    lastActivity: "2026-06-23T10:10:00Z",
  },
  {
    id: "dm2",
    participants: [currentUserId, "u2"], // Artur ↔ Juan
    messages: [
      {
        id: "dm2-1",
        content: "Oye bro, tienes un momento para revisar el PR?",
        author: { id: "u2", username: "Juan", avatarUrl: null },
        channel: { id: "dm2", name: "Juan" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-22T15:00:00Z",
        updatedAt: "2026-06-22T15:00:00Z",
      },
      {
        id: "dm2-2",
        content: "Dame 10 min y lo veo!",
        author: { id: currentUserId, username: "Artur", avatarUrl: null },
        channel: { id: "dm2", name: "Juan" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-22T15:05:00Z",
        updatedAt: "2026-06-22T15:05:00Z",
      },
    ],
    lastActivity: "2026-06-22T15:05:00Z",
  },
  {
    id: "dm3",
    participants: [currentUserId, "u4"], // Artur ↔ Ana
    messages: [
      {
        id: "dm3-1",
        content: "Hola Artur! Te llegó la invitación a la reunión?",
        author: { id: "u4", username: "Ana", avatarUrl: null },
        channel: { id: "dm3", name: "Ana" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-21T09:00:00Z",
        updatedAt: "2026-06-21T09:00:00Z",
      },
      {
        id: "dm3-2",
        content: "Si, ya la vi. Estaré ahí!",
        author: { id: currentUserId, username: "Artur", avatarUrl: null },
        channel: { id: "dm3", name: "Ana" },
        replyTo: null,
        readBy: [],
        createdAt: "2026-06-21T09:05:00Z",
        updatedAt: "2026-06-21T09:05:00Z",
      },
    ],
    lastActivity: "2026-06-21T09:05:00Z",
  },
];

/** Get the other participant's ID in a DM conversation */
export function getOtherParticipantId(dm: DMConversation): string {
  return dm.participants.find((p) => p !== currentUserId) ?? dm.participants[0];
}

/** Get the other participant's user data */
export function getOtherParticipant(dm: DMConversation) {
  const otherId = getOtherParticipantId(dm);
  return mockUsers.find((u) => u.id === otherId)!;
}

/** Get unread count for a DM (simulated) */
export function getDMUnreadCount(dmId: string): number {
  const counts: Record<string, number> = {
    dm1: 2,
    dm2: 1,
    dm3: 0,
  };
  return counts[dmId] ?? 0;
}
