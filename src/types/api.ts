/** API-related types for DummyJSON authentication and responses */

export interface LoginRequest {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  expiresInMins?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export interface ApiError {
  message: string;
  status: number;
}

/** JSONPlaceholder post shape used for notification polling */
export interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}
