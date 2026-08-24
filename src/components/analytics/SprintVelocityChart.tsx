import React, { useMemo } from 'react';
import { useBoardStore } from '../../stores/board.store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Sprint } from '../../types';

interface SprintVelocityChartProps {
  sprints: Sprint[];
}

/**
 * Bar chart showing the number of completed tasks per sprint.
 * Derives data from the board store for real-time accuracy.
 */
const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({ sprints }) => {
  const tasks = useBoardStore((s) => s.tasks);

  const data = useMemo(() => {
    return sprints.map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
      const completed = sprintTasks.filter((t) => t.status === 'done').length;
      const total = sprintTasks.length;
      return {
        name: sprint.name,
        completed,
        total,
      };
    });
  }, [tasks, sprints]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Sprint Velocity</h3>
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
            <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[4, 4, 0, 0]} animationDuration={800} />
            <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SprintVelocityChart;
