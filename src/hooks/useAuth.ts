import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { loginUser, getCurrentUser } from '../services/auth.service';
import { refreshToken as refreshTokenService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from './useToast';
import type { LoginRequest } from '../types/api';

/**
 * Authentication hook providing login, logout, and session management.
 *
 * Combines TanStack Query for server-state (login mutation, user query)
 * with Zustand for client-state (tokens, auth status).
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

  /** Validates existing session on app startup */
  const sessionQuery = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { refreshToken, rememberMe } = useAuthStore.getState();

      if (!refreshToken || !rememberMe) {
        clearAuthState();
        return null;
      }

      try {
        const tokens = await refreshTokenService(refreshToken);
        setTokens(tokens.accessToken, tokens.refreshToken);

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
        return currentUser;
      } catch {
        clearAuthState();
        return null;
      }
    },
    enabled: isLoading,
    retry: false,
    staleTime: Infinity,
  });

  /** Handles login with optional remember me */
  const login = useCallback(
    (username: string, password: string, rememberMe: boolean = false) => {
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
    isLoading: isLoading && sessionQuery.isLoading,
    login,
    logout,
    loginError: loginMutation.error,
    isLoginPending: loginMutation.isPending,
  };
}
