import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '../stores/board.store';
import { useAuthStore } from '../stores/auth.store';
import { useTasks, useSprints } from '../hooks/useTasks';

/**
 * Dashboard overview page showing sprint stats and quick actions.
 * Data is derived from the board store for real-time updates.
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { isLoading } = useTasks();
  const { data: sprints } = useSprints();
  const tasks = useBoardStore((s) => s.tasks);

  const stats = useMemo(() => {
    const total = tasks.length;
    const backlog = tasks.filter((t) => t.status === 'backlog').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const review = tasks.filter((t) => t.status === 'review').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter(
      (t) => !t.completedAt && new Date(t.dueDate) < new Date()
    ).length;

    return { total, backlog, inProgress, review, done, overdue };
  }, [tasks]);

  const currentSprint = useMemo(() => {
    if (!sprints) return null;
    const now = new Date();
    return sprints.find((s) => new Date(s.startDate) <= now && new Date(s.endDate) >= now) ?? sprints[sprints.length - 1];
  }, [sprints]);

  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Completed',
      value: stats.done,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName ?? 'User'} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here's your sprint overview for{' '}
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {currentSprint?.name ?? 'the current sprint'}
          </span>
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Sprint progress + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sprint progress */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sprint Progress</h2>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Completion</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionRate}%` }}
                role="progressbar"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Column breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Backlog', value: stats.backlog, color: 'bg-slate-400' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500' },
              { label: 'Review', value: stats.review, color: 'bg-violet-500' },
              { label: 'Done', value: stats.done, color: 'bg-emerald-500' },
            ].map((col) => (
              <div key={col.label} className="text-center">
                <div className={`w-2 h-2 rounded-full ${col.color} mx-auto mb-1.5`} />
                <p className="text-lg font-bold text-slate-900 dark:text-white">{col.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{col.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/board"
              className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Sprint Board</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage tasks</p>
              </div>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Analytics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">View insights</p>
              </div>
            </Link>
          </div>

          {/* Sprint info */}
          {currentSprint && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{currentSprint.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {new Date(currentSprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' — '}
                {new Date(currentSprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
