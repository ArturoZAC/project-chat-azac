import { create } from "zustand";
import type { Channel } from "@/modules/chat/interfaces/channel.interface";

type ChatTab = "messages" | "channels";

interface ChatStore {
  activeTab: ChatTab;
  activeChannelId: string | null;
  activeChannel: Channel | null;
  isMembersPanelOpen: boolean;
  isCreateModalOpen: boolean;
  isNotificationPanelOpen: boolean;
  /** IDs of channels the current user has joined (tracked client-side) */
  joinedChannelIds: string[];

  setActiveTab: (tab: ChatTab) => void;
  setActiveChannelId: (id: string | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  toggleMembersPanel: () => void;
  setMembersPanelOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  addJoinedChannel: (id: string) => void;
  removeJoinedChannel: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeTab: "channels",
  activeChannelId: null,
  activeChannel: null,
  isMembersPanelOpen: false,
  isCreateModalOpen: false,
  isNotificationPanelOpen: false,
  joinedChannelIds: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  toggleMembersPanel: () => set((s) => ({ isMembersPanelOpen: !s.isMembersPanelOpen })),
  setMembersPanelOpen: (open) => set({ isMembersPanelOpen: open }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setNotificationPanelOpen: (open) => set({ isNotificationPanelOpen: open }),
  addJoinedChannel: (id) => set((s) => ({
    joinedChannelIds: s.joinedChannelIds.includes(id) ? s.joinedChannelIds : [...s.joinedChannelIds, id],
  })),
  removeJoinedChannel: (id) => set((s) => ({
    joinedChannelIds: s.joinedChannelIds.filter((c) => c !== id),
  })),
}));
