import apiClient from '../lib/api-client';
import type { LoginRequest, LoginResponse, RefreshTokenResponse, AuthUser } from '../types/api';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
} as const;

/**
 * Authenticates a user with username and password via DummyJSON.
 * Returns access/refresh tokens and user profile.
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: credentials.expiresInMins ?? 30,
  });
  return response.data;
};

/**
 * Refreshes the access token using a valid refresh token.
 */
export const refreshToken = async (token: string): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, {
    refreshToken: token,
    expiresInMins: 30,
  });
  return response.data;
};

/**
 * Fetches the currently authenticated user's profile.
 * Requires a valid access token (attached by interceptor).
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>(AUTH_ENDPOINTS.ME);
  return response.data;
};
