import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useBoardStore } from '../../stores/board.store';

/**
 * Stacked bar chart showing task priorities across board columns.
 * Data derived live from the board store.
 */
const PriorityBreakdownChart: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);

  const data = useMemo(() => {
    const columns = ['Backlog', 'In Progress', 'Review', 'Done'] as const;
    const statusKeys = ['backlog', 'in-progress', 'review', 'done'] as const;

    return columns.map((name, i) => {
      const columnTasks = tasks.filter((t) => t.status === statusKeys[i]);
      return {
        name,
        High: columnTasks.filter((t) => t.priority === 'high').length,
        Medium: columnTasks.filter((t) => t.priority === 'medium').length,
        Low: columnTasks.filter((t) => t.priority === 'low').length,
      };
    });
  }, [tasks]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Priority Breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-slate-500" />
            <YAxis tick={{ fontSize: 12 }} className="text-slate-500" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e2e8f0)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="High" stackId="priority" fill="#ef4444" radius={[0, 0, 0, 0]} animationDuration={800} />
            <Bar dataKey="Medium" stackId="priority" fill="#f59e0b" radius={[0, 0, 0, 0]} animationDuration={800} />
            <Bar dataKey="Low" stackId="priority" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriorityBreakdownChart;
