import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import type { Task, TaskStatus, User } from '../../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
}

const columnColors: Record<TaskStatus, string> = {
  backlog: 'from-slate-400 to-slate-500',
  'in-progress': 'from-blue-500 to-indigo-500',
  review: 'from-violet-500 to-purple-500',
  done: 'from-emerald-500 to-teal-500',
};

/**
 * Droppable Kanban column with sortable task list.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 */
const KanbanColumn: React.FC<KanbanColumnProps> = memo(({ id, title, tasks, users, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getUserById = (userId: number): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  return (
    <div
      className={clsx(
        'flex flex-col w-72 lg:w-80 flex-shrink-0 lg:flex-shrink rounded-xl transition-colors duration-200',
        'bg-slate-100/50 dark:bg-slate-800/30',
        isOver && 'ring-2 ring-indigo-400 dark:ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className={clsx('w-2.5 h-2.5 rounded-full bg-gradient-to-br', columnColors[id])} />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 px-2 pb-2 space-y-2 min-h-[100px] overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={getUserById(task.assigneeId)}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-xs text-slate-400 dark:text-slate-500">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
