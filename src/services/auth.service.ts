import apiClient from '../lib/api-client';
import { useAuthStore } from '../stores/auth.store';
import type { LoginRequest, LoginResponse, RefreshTokenResponse, AuthUser, RegisterRequest, RegisterResponse } from '../types/api';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  REGISTER: '/users/add',
} as const;

const REGISTERED_USERS_KEY = 'sprintdesk_registered_users';

interface RegisteredUserRecord {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  image: string;
}

const getRegisteredUsers = (): RegisteredUserRecord[] => {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUser = (user: RegisteredUserRecord) => {
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex((u) => u.username.toLowerCase() === user.username.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
};

/**
 * Authenticates a user with username and password.
 * Checks locally registered accounts first, then falls back to DummyJSON API.
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const registeredUsers = getRegisteredUsers();
  const localMatch = registeredUsers.find(
    (u) =>
      u.username.toLowerCase() === credentials.username.toLowerCase() &&
      u.password === credentials.password
  );

  if (localMatch) {
    return {
      id: localMatch.id,
      username: localMatch.username,
      email: localMatch.email,
      firstName: localMatch.firstName,
      lastName: localMatch.lastName,
      gender: 'neutral',
      image: localMatch.image,
      accessToken: `registered-access-${localMatch.id}`,
      refreshToken: `registered-refresh-${localMatch.id}`,
    };
  }

  const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: credentials.expiresInMins ?? 30,
  });
  return response.data;
};

/**
 * Registers a new user via DummyJSON users/add endpoint and stores locally.
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  let createdId = Date.now();
  try {
    const response = await apiClient.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, data);
    if (response.data?.id) createdId = response.data.id;
  } catch {
    // Fallback if network or DummyJSON endpoints fail
  }

  const newRecord: RegisteredUserRecord = {
    id: createdId,
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    email: data.email,
    password: data.password,
    image: `https://dummyjson.com/icon/${data.username}/128`,
  };

  saveRegisteredUser(newRecord);

  return {
    id: newRecord.id,
    firstName: newRecord.firstName,
    lastName: newRecord.lastName,
    username: newRecord.username,
    email: newRecord.email,
  };
};

/**
 * Refreshes the access token using a valid refresh token.
 */
export const refreshToken = async (token: string): Promise<RefreshTokenResponse> => {
  if (token.startsWith('registered-refresh-')) {
    const id = token.replace('registered-refresh-', '');
    return {
      accessToken: `registered-access-${id}`,
      refreshToken: token,
    };
  }

  const response = await apiClient.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, {
    refreshToken: token,
    expiresInMins: 30,
  });
  return response.data;
};

/**
 * Fetches the currently authenticated user's profile.
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
  const { user } = useAuthStore.getState();
  if (user) return user;
  const response = await apiClient.get<AuthUser>(AUTH_ENDPOINTS.ME);
  return response.data;
};
