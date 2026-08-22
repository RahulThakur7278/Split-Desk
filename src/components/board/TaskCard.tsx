import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import type { Task, User } from '../../types';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick: (task: Task) => void;
  isDragOverlay?: boolean;
}

/**
 * Draggable task card for the Kanban board.
 * Shows priority, assignee, due date, and drag handle.
 * Wrapped in React.memo for performance optimization.
 */
const TaskCard: React.FC<TaskCardProps> = memo(({ task, assignee, onClick, isDragOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = !task.completedAt && new Date(task.dueDate) < new Date();

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative p-3.5 rounded-xl border bg-white dark:bg-slate-800 transition-all duration-200',
        'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800',
        isDragging && 'opacity-40 shadow-lg scale-[1.02]',
        isDragOverlay && 'shadow-2xl rotate-2 scale-105 cursor-grabbing',
        !isDragging && !isDragOverlay && 'cursor-pointer',
        'border-slate-200 dark:border-slate-700'
      )}
      onClick={() => !isDragging && onClick(task)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing transition-opacity"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-900 dark:text-white pr-8 line-clamp-2 mb-2.5">
        {task.title}
      </h4>

      {/* Priority badge */}
      <div className="mb-3">
        <Badge variant="priority" priority={task.priority}>
          {task.priority}
        </Badge>
      </div>

      {/* Footer: Assignee + Due date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            src={assignee?.avatar}
            alt={assignee?.name ?? 'Unassigned'}
            name={assignee?.name}
            size="xs"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
            {assignee?.name?.split(' ')[0] ?? 'Unassigned'}
          </span>
        </div>
        <span
          className={clsx(
            'text-xs font-medium flex items-center gap-1',
            isOverdue
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
