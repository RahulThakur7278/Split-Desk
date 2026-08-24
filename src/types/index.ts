/** Domain types for SprintDesk */

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export type NotificationType = 'task' | 'review' | 'system';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: AppNotification[];
}

/** Column configuration for the Kanban board */
export interface BoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

/** Toast notification for UI feedback */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Create task form data */
export interface CreateTaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
}

/** Edit task form data */
export interface EditTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: number;
  dueDate?: string;
}
