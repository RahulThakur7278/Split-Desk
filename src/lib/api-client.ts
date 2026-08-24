import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { RefreshTokenResponse } from '../types/api';

/**
 * Axios instance configured for DummyJSON API.
 * Includes interceptors for automatic token attachment and silent refresh.
 */
const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Flag to prevent multiple simultaneous refresh attempts */
let isRefreshing = false;

/** Queue of requests waiting for token refresh to complete */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Processes the queue of failed requests after a token refresh attempt.
 * Resolves or rejects each queued promise based on the refresh outcome.
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor: attaches Bearer token to outgoing requests.
 * Skips auth endpoints to prevent circular dependency.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: handles 401 errors by attempting silent token refresh.
 * Queues concurrent failed requests and retries them after successful refresh.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshTokenResponse>(
          'https://dummyjson.com/auth/refresh',
          { refreshToken, expiresInMins: 30 },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
