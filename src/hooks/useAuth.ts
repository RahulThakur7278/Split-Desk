import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { loginUser, getCurrentUser, refreshToken as refreshTokenService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from './useToast';
import type { LoginRequest } from '../types/api';

/**
 * Validates existing session on app startup when Remember Me is enabled.
 * Designed to be called at the root component level (AuthInitializer).
 */
export function useAuthInitializer() {
  const { setLoading, setTokens, setUser, logout: clearAuthState } = useAuthStore();
  const isLoading = useAuthStore((state) => state.isLoading);

  useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { refreshToken, rememberMe, user: persistedUser } = useAuthStore.getState();

      if (!refreshToken || !rememberMe) {
        clearAuthState();
        setLoading(false);
        return null;
      }

      try {
        const tokens = await refreshTokenService(refreshToken);
        setTokens(tokens.accessToken, tokens.refreshToken);

        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch {
          if (persistedUser) {
            setUser(persistedUser);
          }
        }
        setLoading(false);
        return tokens;
      } catch (err) {
        console.warn('Session refresh failed:', err);
        clearAuthState();
        setLoading(false);
        return null;
      }
    },
    enabled: isLoading,
    retry: false,
    staleTime: Infinity,
  });
}

/**
 * Authentication hook providing login, logout, and session status.
 */
export function useAuth() {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const {
    user,
    isAuthenticated,
    isLoading,
    setTokens,
    setUser,
    setLoading,
    setRememberMe,
    logout: clearAuthState,
  } = useAuthStore();

  /** Login mutation */
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => loginUser(credentials),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
      });
      setLoading(false);
      navigate('/dashboard');
    },
    onError: () => {
      showError('Login failed', 'Invalid username or password. Please try again.');
    },
  });

  /** Handles login with optional remember me */
  const login = useCallback(
    (username: string, password: string, rememberMe: boolean = true) => {
      setRememberMe(rememberMe);
      loginMutation.mutate({ username, password });
    },
    [loginMutation, setRememberMe]
  );

  /** Handles logout with state cleanup and navigation */
  const logout = useCallback(() => {
    clearAuthState();
    navigate('/login');
  }, [clearAuthState, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loginError: loginMutation.error,
    isLoginPending: loginMutation.isPending,
  };
}
