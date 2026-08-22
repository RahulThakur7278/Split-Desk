import { create } from 'zustand';
import type { Toast, ToastType } from '../types';

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Toast store managing UI feedback notifications.
 * Separate from the notification system — these are ephemeral UI messages.
 *
 * Not persisted: toasts are transient and should not survive page refresh.
 */
export const useToastStore = create<ToastState & ToastActions>()((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = toast.duration ?? 5000;
    const newToast: Toast = { ...toast, id, duration };

    set({ toasts: [...get().toasts, newToast] });

    if (duration > 0) {
      setTimeout(() => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

/**
 * Convenience hook for toast operations.
 * Provides type-specific methods for common toast patterns.
 */
export function useToast() {
  const { addToast, removeToast, clearToasts, toasts } = useToastStore();

  const toast = (type: ToastType, title: string, message?: string, action?: Toast['action']) => {
    return addToast({ type, title, message, action });
  };

  return {
    toasts,
    toast,
    success: (title: string, message?: string) => toast('success', title, message),
    error: (title: string, message?: string) => toast('error', title, message),
    warning: (title: string, message?: string) => toast('warning', title, message),
    info: (title: string, message?: string) => toast('info', title, message),
    remove: removeToast,
    clear: clearToasts,
    addToast,
  };
}
