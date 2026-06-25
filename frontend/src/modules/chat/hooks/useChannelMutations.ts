import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/modules/chat/store/chat.store";
import type { CreateChannelInput } from "@/modules/chat/schemas/chat.schema";
import { mockChannels, mockMemberships, mockMembers } from "@/modules/chat/lib/mock-data";
import type { Channel } from "@/modules/chat/interfaces/channel.interface";

const CHANNELS_KEY = ["channels"];
const MEMBERSHIPS_KEY = ["memberships"];

export function useChannelMutations() {
  const qc = useQueryClient();
  const setCreateModalOpen = useChatStore((s) => s.setCreateModalOpen);

  const createChannelMutation = useMutation({
    mutationFn: async (input: CreateChannelInput): Promise<Channel> => {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 500));

      const newChannel: Channel = {
        id: `ch${Date.now()}`,
        name: input.name,
        description: input.description,
        type: input.isPrivate ? "PRIVATE" : "PUBLIC",
        owner: { id: "me", username: "Artur" },
        membersCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mutate mock data in place for demo purposes
      mockChannels.unshift(newChannel);
      mockMemberships.push(newChannel.id);
      mockMembers[newChannel.id] = [];

      return newChannel;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      qc.invalidateQueries({ queryKey: MEMBERSHIPS_KEY });
      setCreateModalOpen(false);
    },
  });

  const joinChannelMutation = useMutation({
    mutationFn: async (channelId: string): Promise<void> => {
      await new Promise((r) => setTimeout(r, 300));
      // Simulate joining
      if (!mockMemberships.includes(channelId)) {
        mockMemberships.push(channelId);
        const channel = mockChannels.find((c) => c.id === channelId);
        if (channel) channel.membersCount += 1;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      qc.invalidateQueries({ queryKey: MEMBERSHIPS_KEY });
    },
  });

  return {
    createChannelMutation,
    joinChannelMutation,
  };
}
