import { apiClient } from '@/lib/api/client';
import type { AuthUser } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

/**
 * Client-side API calls for authentication endpoints.
 * Used in browser components ('use client') only.
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiClient<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    apiClient<MeResponse>('/api/auth/me'),
};

