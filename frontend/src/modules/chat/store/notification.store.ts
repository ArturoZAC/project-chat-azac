import { create } from "zustand";

export interface Notification {
  id: string;
  type: "dm" | "channel";
  title: string;
  message: string;
  channelName?: string | null;
  conversationId?: string | null;
  channelId?: string | null;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  isRead: boolean;
  /** Derived key used to de-duplicate notifications for the same channel/conversation */
  groupKey?: string;
}

type NotificationFilter = "all" | "dm" | "channel";

/** Builds the de-duplication key from a notification's type + target id */
function toGroupKey(n: {
  type: "dm" | "channel";
  channelId?: string | null;
  conversationId?: string | null;
}): string {
  return n.type === "channel" ? `ch:${n.channelId}` : `dm:${n.conversationId}`;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  filter: NotificationFilter;

  addNotification: (notification: Omit<Notification, "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotificationsForConversation: (conversationId: string) => void;
  removeNotificationsForChannel: (channelId: string) => void;
  setFilter: (filter: NotificationFilter) => void;
  /** Replace every notification that belongs to an incoming group with fresh API data */
  syncFromApi: (apiNotifications: Omit<Notification, "isRead">[]) => void;
  /** Wipe all notifications (used on logout) */
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  filter: "all",

  addNotification: (notification) => {
    const groupKey = toGroupKey(notification);

    // If a notification for this channel/conversation already exists, update it
    // in place (latest data wins) instead of creating a duplicate entry.
    const exists = get().notifications.some((n) => n.groupKey === groupKey);
    if (exists) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.groupKey === groupKey
            ? { ...notification, groupKey, isRead: n.isRead }
            : n,
        ),
      }));
      return;
    }

    set((state) => ({
      notifications: [
        { ...notification, groupKey, isRead: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  removeNotificationsForConversation: (conversationId) => {
    set((state) => {
      const filtered = state.notifications.filter(
        (n) => n.conversationId !== conversationId,
      );
      return {
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.isRead).length,
      };
    });
  },

  removeNotificationsForChannel: (channelId) => {
    set((state) => {
      const filtered = state.notifications.filter(
        (n) => n.channelId !== channelId,
      );
      return {
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.isRead).length,
      };
    });
  },

  setFilter: (filter) => set({ filter }),

  syncFromApi: (apiNotifications) => {
    const current = get();
    const incomingGroupKeys = new Set(
      apiNotifications.map((n) => toGroupKey(n)),
    );

    // Drop any existing entry (socket or previous api sync) that belongs to a
    // group we are about to re-seed, so each channel/conversation has 1 entry.
    const kept = current.notifications.filter(
      (n) => !incomingGroupKeys.has(n.groupKey ?? ""),
    );

    const fresh = apiNotifications.map((n) => ({
      ...n,
      groupKey: toGroupKey(n),
      isRead: false,
    }));

    const all = [...fresh, ...kept];
    set({
      notifications: all,
      unreadCount: all.filter((n) => !n.isRead).length,
    });
  },

  reset: () => set({ notifications: [], unreadCount: 0, filter: "all" }),
}));
