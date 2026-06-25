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

  setActiveTab: (tab: ChatTab) => void;
  setActiveChannelId: (id: string | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  toggleMembersPanel: () => void;
  setMembersPanelOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeTab: "channels",
  activeChannelId: null,
  activeChannel: null,
  isMembersPanelOpen: false,
  isCreateModalOpen: false,
  isNotificationPanelOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  toggleMembersPanel: () => set((s) => ({ isMembersPanelOpen: !s.isMembersPanelOpen })),
  setMembersPanelOpen: (open) => set({ isMembersPanelOpen: open }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setNotificationPanelOpen: (open) => set({ isNotificationPanelOpen: open }),
}));
