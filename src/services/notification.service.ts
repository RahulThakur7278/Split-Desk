import type { JsonPlaceholderPost } from '../types/api';
import type { AppNotification } from '../types';
import { fetchMockData } from './mock-data.service';

const NOTIFICATION_POLL_URL = 'https://jsonplaceholder.typicode.com/posts';

/**
 * Polls JSONPlaceholder for new posts to simulate real-time notifications.
 * Uses limit and skip for pagination to get fresh post IDs over time.
 */
export const pollNotifications = async (page: number = 1): Promise<JsonPlaceholderPost[]> => {
  const response = await fetch(
    `${NOTIFICATION_POLL_URL}?_limit=5&_start=${(page - 1) * 5}`
  );

  if (!response.ok) {
    throw new Error(`Notification poll failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetches initial notifications from mock data.
 */
export const fetchInitialNotifications = async (): Promise<AppNotification[]> => {
  const data = await fetchMockData();
  return data.notifications;
};

/**
 * Converts a JSONPlaceholder post into an AppNotification.
 */
export const postToNotification = (post: JsonPlaceholderPost): AppNotification => {
  return {
    id: post.id + 1000,
    title: 'New update',
    message: post.title,
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
  };
};
