import { useQuery } from "@tanstack/react-query";
import { getChannelsAction } from "@/modules/chat/actions/channels/get-channels.action";
import { getChannelAction } from "@/modules/chat/actions/channels/get-channel.action";
import { getChannelMessagesAction } from "@/modules/chat/actions/channels/get-channel-messages.action";
import { getMembershipsAction } from "@/modules/chat/actions/channels/get-memberships.action";
import {
  getChannelMembersAction,
  type MemberApiData,
} from "@/modules/chat/actions/channels/get-channel-members.action";
import type { Channel, ChannelMember } from "@/modules/chat/interfaces/channels/channel.interface";
import type { Message } from "@/modules/chat/interfaces/message.interface";
import type { ChannelBackend } from "@/modules/chat/interfaces/channels/channel-backend.interface";
import type { ChannelMessageBackend } from "@/modules/chat/interfaces/channels/channel-message-backend.interface";

const CHANNELS_KEY = ["channels"];
const CHANNEL_KEY = (id: string) => ["channels", id];
const MESSAGES_KEY = (id: string) => ["messages", id];
const MEMBERS_KEY = (id: string) => ["members", id];
const MEMBERSHIPS_KEY = ["memberships"];
const UNREAD_KEY = ["unread"];

// ─── Mappers ──────────────────────────────────────────

function mapChannel(ch: ChannelBackend): Channel {
  return {
    id: ch.id,
    name: ch.name,
    description: ch.description ?? undefined,
    type: ch.isPrivate ? "PRIVATE" : "PUBLIC",
    owner: { id: ch.createdById, username: "" },
    membersCount: ch.membersCount,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
  };
}

function mapChannelMessage(msg: ChannelMessageBackend, channelName: string): Message {
  return {
    id: msg.id,
    content: msg.content,
    isSystem: msg.isSystem,
    author: { id: msg.senderId, username: msg.senderUsername ?? "", avatarUrl: msg.senderAvatarUrl ?? null },
    channel: { id: msg.channelId, name: channelName },
    replyTo: msg.parentId ?? null,
    readBy: [],
    createdAt: msg.createdAt,
    updatedAt: msg.createdAt,
  };
}

export function useChannelQueries(channelId?: string, options?: { enabled?: boolean }) {
  const queriesEnabled = options?.enabled ?? true;
  // ── Channels ──────────────────────────────────────────

  const getAllChannels = useQuery({
    queryKey: CHANNELS_KEY,
    queryFn: async (): Promise<Channel[]> => {
      const res = await getChannelsAction();
      if (!res.success) return [];
      return (res.data as { data: ChannelBackend[] }).data.map(mapChannel);
    },
    enabled: queriesEnabled,
  });

  const getChannel = useQuery({
    queryKey: CHANNEL_KEY(channelId!),
    queryFn: async (): Promise<Channel | null> => {
      if (!channelId) return null;
      const res = await getChannelAction(channelId);
      if (!res.success) return null;
      return mapChannel(res.data as ChannelBackend);
    },
    enabled: !!channelId,
  });

  // ── Messages ──────────────────────────────────────────

  const getMessages = useQuery({
    queryKey: MESSAGES_KEY(channelId!),
    queryFn: async (): Promise<Message[]> => {
      if (!channelId) return [];
      const res = await getChannelMessagesAction(channelId);
      if (!res.success) return [];

      // Look up channel name from cache
      const channelName = getAllChannels.data?.find((c) => c.id === channelId)?.name ?? "";

      return (res.data as { data: ChannelMessageBackend[] }).data.map((msg) =>
        mapChannelMessage(msg, channelName),
      );
    },
    enabled: !!channelId,
  });

  // ── Members (fetched from API) ─────────────────────

  const getMembers = useQuery({
    queryKey: MEMBERS_KEY(channelId!),
    queryFn: async (): Promise<ChannelMember[]> => {
      if (!channelId) return [];
      const response = await getChannelMembersAction(channelId);
      if (!response.success || !response.data) return [];
      return response.data.map((member: MemberApiData) => ({
        id: member.id,
        user: {
          id: member.userId,
          username: member.username,
          email: "",
          avatarUrl: null,
          isOnline: member.isOnline,
        },
        role: member.role === "ADMIN" ? "OWNER" : "MEMBER",
        joinedAt: member.joinedAt,
      }));
    },
    enabled: !!channelId,
  });

  // ── Memberships (fetched from API, synced to Zustand) ─

  const getMemberships = useQuery({
    queryKey: MEMBERSHIPS_KEY,
    queryFn: async (): Promise<string[]> => {
      const response = await getMembershipsAction();
      if (!response.success) return [];
      return response.data;
    },
    staleTime: 30_000,
    enabled: queriesEnabled,
  });

  // ── Unread counts (not yet available from backend) ───

  const getUnreadCounts = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: async (): Promise<Record<string, number>> => {
      return {};
    },
  });

  const getTotalUnread = useQuery({
    queryKey: ["unread", "total"],
    queryFn: async (): Promise<number> => {
      return 0;
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
