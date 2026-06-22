import { useQuery } from "@tanstack/react-query";
import type { Channel, ChannelMember } from "@/shared/interfaces/channel.interface";
import type { Message } from "@/shared/interfaces/message.interface";
import {
  mockChannels,
  mockMessages,
  mockMembers,
  mockMemberships,
  mockUnreadCounts,
} from "@/modules/chat/lib/mock-data";

const CHANNELS_KEY = ["channels"];
const CHANNEL_KEY = (id: string) => ["channels", id];
const MESSAGES_KEY = (id: string) => ["messages", id];
const MEMBERS_KEY = (id: string) => ["members", id];
const MEMBERSHIPS_KEY = ["memberships"];
const UNREAD_KEY = ["unread"];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve a channel slug (ID or name) to its normalized ID */
function resolveChannelId(idOrName: string): string | undefined {
  const channel =
    mockChannels.find((c) => c.id === idOrName) ??
    mockChannels.find((c) => c.name.toLowerCase() === idOrName.toLowerCase());
  return channel?.id;
}

export function useChannelQueries(channelId?: string) {
  const getAllChannels = useQuery({
    queryKey: CHANNELS_KEY,
    queryFn: async (): Promise<Channel[]> => {
      await delay();
      return mockChannels;
    },
  });

  const getChannel = useQuery({
    queryKey: CHANNEL_KEY(channelId!),
    queryFn: async (): Promise<Channel | null> => {
      await delay();
      const resolvedId = resolveChannelId(channelId!);
      return mockChannels.find((c) => c.id === resolvedId) ?? null;
    },
    enabled: !!channelId,
  });

  const getMessages = useQuery({
    queryKey: MESSAGES_KEY(channelId!),
    queryFn: async (): Promise<Message[]> => {
      await delay(400);
      const resolvedId = resolveChannelId(channelId!);
      return resolvedId ? (mockMessages[resolvedId] ?? []) : [];
    },
    enabled: !!channelId,
  });

  const getMembers = useQuery({
    queryKey: MEMBERS_KEY(channelId!),
    queryFn: async (): Promise<ChannelMember[]> => {
      await delay(250);
      const resolvedId = resolveChannelId(channelId!);
      return resolvedId ? (mockMembers[resolvedId] ?? []) : [];
    },
    enabled: !!channelId,
  });

  const getMemberships = useQuery({
    queryKey: MEMBERSHIPS_KEY,
    queryFn: async (): Promise<string[]> => {
      await delay(200);
      return mockMemberships;
    },
  });

  const getUnreadCounts = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: async (): Promise<Record<string, number>> => {
      await delay(200);
      return mockUnreadCounts;
    },
  });

  const getTotalUnread = useQuery({
    queryKey: ["unread", "total"],
    queryFn: async (): Promise<number> => {
      await delay(150);
      return Object.values(mockUnreadCounts).reduce((a, b) => a + b, 0);
    },
  });

  return {
    getAllChannels,
    getChannel,
    getMessages,
    getMembers,
    getMemberships,
    getUnreadCounts,
    getTotalUnread,
  };
}
