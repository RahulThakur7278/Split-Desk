import { fetchMockData } from './mock-data.service';
import type { Task, User, Sprint, Comment } from '../types';

export const fetchTasks = async (): Promise<Task[]> => {
  const data = await fetchMockData();
  return data.tasks;
};

export const fetchUsers = async (): Promise<User[]> => {
  const data = await fetchMockData();
  return data.users;
};

export const fetchSprints = async (): Promise<Sprint[]> => {
  const data = await fetchMockData();
  return data.sprints;
};

export const fetchCommentsByTaskId = async (taskId: number): Promise<Comment[]> => {
  const data = await fetchMockData();
  return data.comments.filter(c => c.taskId === taskId);
};
