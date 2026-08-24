import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useBoardStore } from '../../stores/board.store';

const STATUS_COLORS: Record<string, string> = {
  Backlog: '#94a3b8',
  'In Progress': '#3b82f6',
  Review: '#8b5cf6',
  Done: '#10b981',
};

/**
 * Pie chart showing task distribution across board columns.
 * Data derived live from the board store.
 */
const TaskStatusChart: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);

  const data = useMemo(() => {
    const statusMap: Record<string, number> = {
      Backlog: 0,
      'In Progress': 0,
      Review: 0,
      Done: 0,
    };

    tasks.forEach((task) => {
      switch (task.status) {
        case 'backlog':
          statusMap['Backlog']++;
          break;
        case 'in-progress':
          statusMap['In Progress']++;
          break;
        case 'review':
          statusMap['Review']++;
          break;
        case 'done':
          statusMap['Done']++;
          break;
      }
    });

    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Task Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e2e8f0)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskStatusChart;
