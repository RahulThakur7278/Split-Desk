import React from 'react';
import { useTasks, useSprints } from '../hooks/useTasks';
import SprintVelocityChart from '../components/analytics/SprintVelocityChart';
import TaskStatusChart from '../components/analytics/TaskStatusChart';
import PriorityBreakdownChart from '../components/analytics/PriorityBreakdownChart';
import CompletionTrendChart from '../components/analytics/CompletionTrendChart';
import { ChartSkeleton } from '../components/ui/Skeleton';

/**
 * Analytics page with responsive chart grid.
 * All charts derive data from the board store (live, not hardcoded).
 */
const AnalyticsPage: React.FC = () => {
  const { isLoading } = useTasks();
  const { data: sprints = [] } = useSprints();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="h-10 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Sprint performance insights and task analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SprintVelocityChart sprints={sprints} />
        <TaskStatusChart />
        <PriorityBreakdownChart />
        <CompletionTrendChart />
      </div>
    </div>
  );
};

export default AnalyticsPage;
