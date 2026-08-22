import React from 'react';
import { clsx } from 'clsx';
import type { TaskPriority, TaskStatus } from '../../types';

type BadgeVariant = 'priority' | 'status' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  priority?: TaskPriority;
  status?: TaskStatus;
  className?: string;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-red-200 dark:ring-red-800',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
};

const statusStyles: Record<TaskStatus, string> = {
  backlog: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-blue-200 dark:ring-blue-800',
  review: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-violet-200 dark:ring-violet-800',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
};

const priorityIcons: Record<TaskPriority, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

/**
 * Badge component for displaying task priority and status.
 * Color-coded with semantic meaning for visual distinction.
 */
const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', priority, status, className }) => {
  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';

  if (variant === 'priority' && priority) {
    styles = priorityStyles[priority];
  } else if (variant === 'status' && status) {
    styles = statusStyles[status];
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset',
        styles,
        className
      )}
    >
      {variant === 'priority' && priority && (
        <span className="text-[10px]" aria-hidden="true">{priorityIcons[priority]}</span>
      )}
      {children}
    </span>
  );
};

export default Badge;
