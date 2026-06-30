import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { createChannelAction } from "@/modules/chat/actions/channels/create-channel.action";
import { joinChannelAction } from "@/modules/chat/actions/channels/join-channel.action";
import { leaveChannelAction } from "@/modules/chat/actions/channels/leave-channel.action";
import { deleteChannelAction } from "@/modules/chat/actions/channels/delete-channel.action";
import { sendChannelMessageAction } from "@/modules/chat/actions/channels/send-channel-message.action";
import { deleteChannelMessageAction } from "@/modules/chat/actions/channels/delete-channel-message.action";
import type { CreateChannelInput } from "@/modules/chat/schemas/chat.schema";

const CHANNELS_KEY = ["channels"];
const MESSAGES_KEY = (id: string) => ["messages", id];
const MEMBERSHIPS_KEY = ["memberships"];

export function useChannelMutations() {
  const qc = useQueryClient();
  const setCreateModalOpen = useChatStore((s) => s.setCreateModalOpen);
  const addJoinedChannel = useChatStore((s) => s.addJoinedChannel);
  const removeJoinedChannel = useChatStore((s) => s.removeJoinedChannel);

  // ── Create channel ──────────────────────────────────
  const createChannelMutation = useMutation({
    mutationFn: async (input: CreateChannelInput) => {
      const res = await createChannelAction({
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate,
      });
      if (!res.success) throw new Error(res.message ?? "Error al crear canal");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      setCreateModalOpen(false);
    },
  });

  // ── Join channel ────────────────────────────────────
  const joinChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await joinChannelAction(channelId);
      if (!res.success) throw new Error(res.message ?? "Error al unirse al canal");
    },
    onSuccess: (_data, channelId) => {
      addJoinedChannel(channelId);
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      qc.invalidateQueries({ queryKey: MEMBERSHIPS_KEY });
    },
  });

  // ── Leave channel ───────────────────────────────────
  const leaveChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await leaveChannelAction(channelId);
      if (!res.success) throw new Error(res.message ?? "Error al salir del canal");
    },
    onSuccess: (_data, channelId) => {
      removeJoinedChannel(channelId);
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      qc.invalidateQueries({ queryKey: MEMBERSHIPS_KEY });
    },
  });

  // ── Delete channel ──────────────────────────────────
  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await deleteChannelAction(channelId);
      if (!res.success) throw new Error(res.message ?? "Error al eliminar canal");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
    },
  });

  // ── Send message ────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      channelId,
      content,
      parentId,
    }: {
      channelId: string;
      content: string;
      parentId?: string;
    }) => {
      const res = await sendChannelMessageAction(channelId, content, parentId);
      if (!res.success) throw new Error(res.message ?? "Error al enviar mensaje");
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: MESSAGES_KEY(variables.channelId) });
    },
  });

  // ── Delete message ──────────────────────────────────
  const deleteMessageMutation = useMutation({
    mutationFn: async ({
      channelId,
      messageId,
    }: {
      channelId: string;
      messageId: string;
    }) => {
      const res = await deleteChannelMessageAction(channelId, messageId);
      if (!res.success) throw new Error(res.message ?? "Error al eliminar mensaje");
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: MESSAGES_KEY(variables.channelId) });
    },
  });

  return {
    createChannelMutation,
    joinChannelMutation,
    leaveChannelMutation,
    deleteChannelMutation,
    sendMessageMutation,
    deleteMessageMutation,
  };
}
