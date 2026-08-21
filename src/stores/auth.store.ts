import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/api';

interface AuthState {
  /** Currently authenticated user profile */
  user: AuthUser | null;
  /** Access token stored in memory (not persisted to localStorage) */
  accessToken: string | null;
  /** Refresh token persisted via localStorage simulation */
  refreshToken: string | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the initial session validation is in progress */
  isLoading: boolean;
  /** Whether "Remember Me" was checked during login */
  rememberMe: boolean;
}

interface AuthActions {
  /** Sets both tokens after login or refresh */
  setTokens: (accessToken: string, refreshToken: string) => void;
  /** Sets the authenticated user profile */
  setUser: (user: AuthUser) => void;
  /** Sets the loading state during session validation */
  setLoading: (loading: boolean) => void;
  /** Sets the remember me preference */
  setRememberMe: (remember: boolean) => void;
  /** Clears all authentication state */
  logout: () => void;
}

/**
 * Authentication store using Zustand with selective persistence.
 *
 * Design decisions:
 * - accessToken is stored in memory only (never persisted) for security
 * - refreshToken is persisted to simulate secure storage
 * - rememberMe controls whether the refresh token survives page refresh
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      rememberMe: false,

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      setRememberMe: (rememberMe) => set({ rememberMe }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          rememberMe: false,
        }),
    }),
    {
      name: 'sprintdesk-auth',
      /**
       * Only persist refreshToken and rememberMe.
       * accessToken deliberately excluded for security.
       */
      partialize: (state) => ({
        refreshToken: state.rememberMe ? state.refreshToken : null,
        rememberMe: state.rememberMe,
        user: state.rememberMe ? state.user : null,
      }),
    }
  )
);
