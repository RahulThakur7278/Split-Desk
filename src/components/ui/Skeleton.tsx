import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Skeleton loading component with shimmer animation.
 * Provides visual feedback during data loading states.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(baseStyles, 'h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
            style={{ width: i === lines - 1 ? '75%' : width, height }}
          />
        ))}
      </div>
    );
  }

  const variantStyles = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl h-32 w-full',
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/** Pre-built skeleton for task cards */
export const TaskCardSkeleton: React.FC = () => (
  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="text" lines={2} />
    <div className="flex items-center justify-between pt-1">
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" width={60} />
    </div>
  </div>
);

/** Pre-built skeleton for the board column */
export const BoardColumnSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-72 space-y-3">
    <Skeleton variant="text" width="50%" height={20} />
    <TaskCardSkeleton />
    <TaskCardSkeleton />
    <TaskCardSkeleton />
  </div>
);

/** Pre-built skeleton for chart areas */
export const ChartSkeleton: React.FC = () => (
  <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
    <Skeleton variant="text" width="40%" height={20} />
    <Skeleton variant="rectangular" height={200} className="w-full" />
  </div>
);

export default Skeleton;
