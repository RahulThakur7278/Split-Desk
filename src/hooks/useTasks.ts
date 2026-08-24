import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchTasks, fetchUsers, fetchSprints, fetchCommentsByTaskId } from '../services/task.service';
import { useBoardStore } from '../stores/board.store';
import type { User, Sprint } from '../types';

/**
 * Hook for fetching and initializing board data.
 * Uses TanStack Query for server-state fetching, Zustand for client-state management.
 *
 * Data flow: Service Layer → TanStack Query → Zustand Store → Components
 */
export function useTasks() {
  const { initialize, isInitialized } = useBoardStore();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000,
    enabled: !isInitialized,
  });

  const commentsQuery = useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const tasks = await fetchTasks();
      const taskIds = tasks.map((t) => t.id);
      const allComments = await Promise.all(taskIds.map((id) => fetchCommentsByTaskId(id)));
      return allComments.flat();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isInitialized,
  });

  /** Initialize board store once both queries complete */
  useEffect(() => {
    if (tasksQuery.data && commentsQuery.data && !isInitialized) {
      initialize(tasksQuery.data, commentsQuery.data);
    }
  }, [tasksQuery.data, commentsQuery.data, isInitialized, initialize]);

  return {
    isLoading: tasksQuery.isLoading || commentsQuery.isLoading,
    isError: tasksQuery.isError || commentsQuery.isError,
    error: tasksQuery.error || commentsQuery.error,
  };
}

/** Hook for fetching user data */
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000,
  });
}

/** Hook for fetching sprint data */
export function useSprints() {
  return useQuery<Sprint[]>({
    queryKey: ['sprints'],
    queryFn: fetchSprints,
    staleTime: 10 * 60 * 1000,
  });
}
