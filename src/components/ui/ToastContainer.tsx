import React from 'react';
import { clsx } from 'clsx';
import { useToastStore } from '../../hooks/useToast';
import type { Toast as ToastType, ToastType as ToastVariant } from '../../types';

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
};

const iconBgStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300',
  error: 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300',
};

/** Individual toast item */
const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'animate-in slide-in-from-right-full fade-in duration-300',
        'max-w-sm w-full',
        variantStyles[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={clsx('flex-shrink-0 p-1 rounded-lg', iconBgStyles[toast.type])}>
        {iconMap[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs opacity-80 line-clamp-2">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast container rendering stacked toast notifications.
 * Positioned fixed in the top-right corner.
 * Uses aria-live region for screen reader announcements.
 */
const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
