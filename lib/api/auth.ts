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
 * Do NOT import in server-side services or route handlers.
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * Calls the logout API to clear the auth cookie, then
   * navigates to /login via the provided Next.js router.
   */
  logout: async (router: { push: (url: string) => void; refresh: () => void }) => {
    await apiClient<{ message: string }>('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  },

  me: () =>
    apiClient<MeResponse>('/api/auth/me'),
};

