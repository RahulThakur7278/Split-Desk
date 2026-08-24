import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types';

interface NotificationState {
  /** All notifications (latest first) */
  notifications: AppNotification[];
  /** Set of post IDs already converted to notifications (prevents duplicates) */
  seenPostIds: number[];
  /** Current polling page for JSONPlaceholder pagination */
  pollPage: number;
}

interface NotificationActions {
  /** Initializes with mock data notifications */
  initialize: (notifications: AppNotification[]) => void;
  /** Adds new notifications from polling */
  addNotifications: (notifications: AppNotification[]) => void;
  /** Marks a post ID as seen to prevent duplicate notifications */
  markPostIdSeen: (id: number) => void;
  /** Marks a single notification as read */
  markAsRead: (notificationId: number) => void;
  /** Marks all notifications as read */
  markAllAsRead: () => void;
  /** Increments the poll page for next batch */
  incrementPollPage: () => void;
  /** Gets unread notification count */
  getUnreadCount: () => number;
}

/**
 * Notification store with persistence.
 *
 * Design decisions:
 * - seenPostIds prevents duplicate notifications from JSONPlaceholder polling
 * - pollPage tracks pagination to fetch different posts over time
 * - Notifications capped at latest 50 to prevent unbounded growth
 */
export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      notifications: [],
      seenPostIds: [],
      pollPage: 1,

      initialize: (notifications) => {
        const state = get();
        if (state.notifications.length === 0) {
          set({ notifications });
        }
      },

      addNotifications: (newNotifications) => {
        const state = get();
        const combined = [...newNotifications, ...state.notifications];
        /** Keep only the latest 50 notifications to prevent unbounded growth */
        set({ notifications: combined.slice(0, 50) });
      },

      markPostIdSeen: (id) => {
        const state = get();
        if (!state.seenPostIds.includes(id)) {
          set({ seenPostIds: [...state.seenPostIds, id] });
        }
      },

      markAsRead: (notificationId) => {
        const state = get();
        set({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        });
      },

      markAllAsRead: () => {
        const state = get();
        set({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        });
      },

      incrementPollPage: () => {
        const state = get();
        set({ pollPage: state.pollPage + 1 });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'sprintdesk-notifications',
    }
  )
);
