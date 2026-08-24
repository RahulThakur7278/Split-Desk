import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser, refreshToken as refreshTokenService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from './useToast';
import type { LoginRequest, RegisterRequest } from '../types/api';

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
 * Authentication hook providing login, registration, logout, and session status.
 */
export function useAuth() {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess, info: showInfo } = useToast();
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
      showSuccess('Login successful!', `Welcome back, ${data.firstName}!`);
      navigate('/dashboard');
    },
    onError: () => {
      showError('Login failed', 'Invalid username or password. Please try again.');
    },
  });

  /** Registration mutation */
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerUser(data),
    onSuccess: (data) => {
      const mockAccessToken = `registered-token-${data.id}-${Date.now()}`;
      const mockRefreshToken = `registered-refresh-${data.id}-${Date.now()}`;
      setRememberMe(true);
      setTokens(mockAccessToken, mockRefreshToken);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: 'neutral',
        image: `https://dummyjson.com/icon/${data.username}/128`,
      });
      setLoading(false);
      showSuccess('Account created!', `Welcome to SprintDesk, ${data.firstName}!`);
      navigate('/dashboard');
    },
    onError: () => {
      showError('Registration failed', 'Could not create account. Please try again.');
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

  /** Handles registration */
  const register = useCallback(
    (data: RegisterRequest) => {
      registerMutation.mutate(data);
    },
    [registerMutation]
  );

  /** Handles logout with state cleanup and navigation */
  const logout = useCallback(() => {
    clearAuthState();
    showInfo('Logged out', 'You have been signed out.');
    navigate('/login');
  }, [clearAuthState, navigate, showInfo]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
}
