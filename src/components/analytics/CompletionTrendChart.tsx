import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBoardStore } from '../../stores/board.store';

/**
 * Area chart showing task completion trend over time.
 * Groups completed tasks by date for a cumulative view.
 */
const CompletionTrendChart: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);

  const data = useMemo(() => {
    const completedTasks = tasks
      .filter((t) => t.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    if (completedTasks.length === 0) return [];

    /** Group by date */
    const dateMap = new Map<string, number>();
    completedTasks.forEach((task) => {
      const date = new Date(task.completedAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dateMap.set(date, (dateMap.get(date) ?? 0) + 1);
    });

    /** Build cumulative trend */
    let cumulative = 0;
    return Array.from(dateMap.entries()).map(([date, count]) => {
      cumulative += count;
      return { date, completed: count, cumulative };
    });
  }, [tasks]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Completion Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-slate-500" />
            <YAxis tick={{ fontSize: 12 }} className="text-slate-500" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e2e8f0)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#completionGradient)"
              name="Total Completed"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompletionTrendChart;
