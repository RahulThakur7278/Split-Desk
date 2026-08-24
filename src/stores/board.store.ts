import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, Comment, CreateTaskData, EditTaskData } from '../types';

interface BoardState {
  /** All tasks on the board, keyed for O(1) lookup */
  tasks: Task[];
  /** Comments associated with tasks */
  comments: Comment[];
  /** Whether initial data has been loaded */
  isInitialized: boolean;
  /** Previous state snapshot for undo functionality */
  previousState: { tasks: Task[]; comments: Comment[] } | null;
}

interface BoardActions {
  /** Initializes the board with fetched tasks and comments */
  initialize: (tasks: Task[], comments: Comment[]) => void;
  /** Adds a new task to the board */
  addTask: (data: CreateTaskData) => Task;
  /** Moves a task to a new column and/or position */
  moveTask: (taskId: number, newStatus: TaskStatus, newOrder: number) => void;
  /** Deletes a task from the board */
  deleteTask: (taskId: number) => void;
  /** Updates task properties */
  editTask: (taskId: number, data: EditTaskData) => void;
  /** Adds a comment to a task */
  addComment: (taskId: number, authorId: number, message: string) => void;
  /** Reorders tasks within a column */
  reorderTask: (taskId: number, newOrder: number) => void;
  /** Undoes the last drag-and-drop action */
  undoLastAction: () => void;
  /** Gets tasks filtered by status */
  getTasksByStatus: (status: TaskStatus) => Task[];
}

/**
 * Board store managing Kanban state with persistence and undo support.
 *
 * Design decisions:
 * - Tasks stored in a flat array for simplicity with Zustand persistence
 * - Column grouping derived via getTasksByStatus selector
 * - Previous state stored for single-level undo of drag operations
 * - Orders recalculated on move to maintain consistency
 */
export const useBoardStore = create<BoardState & BoardActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: [],
      isInitialized: false,
      previousState: null,

      initialize: (tasks, comments) => {
        const state = get();
        if (!state.isInitialized) {
          set({ tasks, comments, isInitialized: true });
        }
      },

      addTask: (data) => {
        const state = get();
        const maxId = state.tasks.reduce((max, t) => Math.max(max, t.id), 0);
        const tasksInBacklog = state.tasks.filter((t) => t.status === 'backlog');
        const maxOrder = tasksInBacklog.reduce((max, t) => Math.max(max, t.order), 0);

        const newTask: Task = {
          id: maxId + 1,
          title: data.title,
          description: data.description,
          status: 'backlog',
          priority: data.priority,
          assigneeId: data.assigneeId,
          dueDate: data.dueDate,
          sprintId: data.sprintId,
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
          completedAt: null,
          updatedAt: new Date().toISOString(),
        };

        set({ tasks: [...state.tasks, newTask] });
        return newTask;
      },

      moveTask: (taskId, newStatus, newOrder) => {
        const state = get();
        set({
          previousState: { tasks: [...state.tasks], comments: [...state.comments] },
        });

        const updatedTasks = state.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              status: newStatus,
              order: newOrder,
              completedAt: newStatus === 'done' ? new Date().toISOString() : task.completedAt,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });

        /** Re-order other tasks in the target column to make room */

        let orderCounter = 1;
        const finalTasks = updatedTasks.map((task) => {
          if (task.id === taskId) return task;
          if (task.status === newStatus) {
            if (orderCounter === newOrder) orderCounter++;
            const result = { ...task, order: orderCounter };
            orderCounter++;
            return result;
          }
          return task;
        });

        set({ tasks: finalTasks });
      },

      deleteTask: (taskId) => {
        const state = get();
        set({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          comments: state.comments.filter((c) => c.taskId !== taskId),
        });
      },

      editTask: (taskId, data) => {
        const state = get();
        set({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                ...data,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          }),
        });
      },

      addComment: (taskId, authorId, message) => {
        const state = get();
        const maxId = state.comments.reduce((max, c) => Math.max(max, c.id), 0);
        const newComment: Comment = {
          id: maxId + 1,
          taskId,
          authorId,
          message,
          createdAt: new Date().toISOString(),
        };
        set({ comments: [...state.comments, newComment] });
      },

      reorderTask: (taskId, newOrder) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;

        set({
          previousState: { tasks: [...state.tasks], comments: [...state.comments] },
        });

        const columnTasks = state.tasks
          .filter((t) => t.status === task.status && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        columnTasks.splice(newOrder - 1, 0, task);

        const reorderedIds = new Set(columnTasks.map((t) => t.id));
        const updatedTasks = state.tasks.map((t) => {
          if (reorderedIds.has(t.id) || t.id === taskId) {
            const index = columnTasks.findIndex((ct) => ct.id === t.id);
            return { ...t, order: index + 1, updatedAt: new Date().toISOString() };
          }
          return t;
        });

        set({ tasks: updatedTasks });
      },

      undoLastAction: () => {
        const state = get();
        if (state.previousState) {
          set({
            tasks: state.previousState.tasks,
            comments: state.previousState.comments,
            previousState: null,
          });
        }
      },

      getTasksByStatus: (status) => {
        return get()
          .tasks.filter((t) => t.status === status)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'sprintdesk-board',
    }
  )
);
