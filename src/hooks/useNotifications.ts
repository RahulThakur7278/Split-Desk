import { useQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { pollNotifications, fetchInitialNotifications, postToNotification } from '../services/notification.service';
import { useNotificationStore } from '../stores/notification.store';
import { useToastStore } from './useToast';

/**
 * Hook for managing the notification system with polling.
 *
 * Features:
 * - Initializes with mock data notifications on first load
 * - Polls JSONPlaceholder every 30 seconds for new posts
 * - Pauses polling when browser tab is hidden
 * - Shows toast for new notifications when panel is closed
 * - Tracks seen post IDs to prevent duplicates
 */
export function useNotifications() {
  const {
    notifications,
    seenPostIds,
    pollPage,
    initialize,
    addNotifications,
    markPostIdSeen,
    markAsRead,
    markAllAsRead,
    incrementPollPage,
    getUnreadCount,
  } = useNotificationStore();

  const { addToast } = useToastStore();

  /** Fetch initial notifications from mock data */
  const initialQuery = useQuery({
    queryKey: ['notifications', 'initial'],
    queryFn: fetchInitialNotifications,
    staleTime: Infinity,
  });

  /** Initialize store with mock data notifications */
  useEffect(() => {
    if (initialQuery.data) {
      initialize(initialQuery.data);
    }
  }, [initialQuery.data, initialize]);

  /** Poll for new notifications */
  const pollQuery = useQuery({
    queryKey: ['notifications', 'poll', pollPage],
    queryFn: () => pollNotifications(pollPage),
    refetchInterval: 30_000,
    /** Pause polling when browser tab is hidden */
    refetchIntervalInBackground: false,
    staleTime: 25_000,
  });

  /** Process polled posts into notifications */
  useEffect(() => {
    if (pollQuery.data) {
      const newPosts = pollQuery.data.filter(
        (post) => !seenPostIds.includes(post.id)
      );

      if (newPosts.length > 0) {
        const newNotifications = newPosts.map(postToNotification);
        addNotifications(newNotifications);

        newPosts.forEach((post) => markPostIdSeen(post.id));

        /** Show toast for new notifications */
        addToast({
          type: 'info',
          title: `${newPosts.length} new notification${newPosts.length > 1 ? 's' : ''}`,
          message: newPosts[0].title,
          duration: 4000,
        });
      }
    }
  }, [pollQuery.data, seenPostIds, addNotifications, markPostIdSeen, addToast]);

  /** Advance poll page periodically to get different posts */
  const fetchNextPage = useCallback(() => {
    incrementPollPage();
  }, [incrementPollPage]);

  return {
    notifications,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    fetchNextPage,
    isLoading: initialQuery.isLoading,
  };
}
