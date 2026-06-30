import { useQuery } from "@tanstack/react-query";
import { getChannelsAction } from "@/modules/chat/actions/channels/get-channels.action";
import { getChannelAction } from "@/modules/chat/actions/channels/get-channel.action";
import { getChannelMessagesAction } from "@/modules/chat/actions/channels/get-channel-messages.action";
import { useChatStore } from "@/modules/chat/store/chat.store";
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
    membersCount: 0, // TODO: backend should return this
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
  };
}

function mapChannelMessage(msg: ChannelMessageBackend, channelName: string): Message {
  return {
    id: msg.id,
    content: msg.content,
    author: { id: msg.senderId, username: "", avatarUrl: "" },
    channel: { id: msg.channelId, name: channelName },
    replyTo: msg.parentId ?? null,
    readBy: [],
    createdAt: msg.createdAt,
    updatedAt: msg.createdAt,
  };
}

export function useChannelQueries(channelId?: string) {
  const joinedChannelIds = useChatStore((s) => s.joinedChannelIds);

  // ── Channels ──────────────────────────────────────────

  const getAllChannels = useQuery({
    queryKey: CHANNELS_KEY,
    queryFn: async (): Promise<Channel[]> => {
      const res = await getChannelsAction();
      if (!res.success) return [];
      return (res.data as { data: ChannelBackend[] }).data.map(mapChannel);
    },
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

  // ── Members (not yet available from backend) ─────────

  const getMembers = useQuery({
    queryKey: MEMBERS_KEY(channelId!),
    queryFn: async (): Promise<ChannelMember[]> => {
      // TODO: implement backend endpoint for members
      return [];
    },
    enabled: !!channelId,
  });

  // ── Memberships (tracked client-side) ────────────────

  const getMemberships = useQuery({
    queryKey: MEMBERSHIPS_KEY,
    queryFn: async (): Promise<string[]> => {
      return joinedChannelIds;
    },
    staleTime: 0,
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
