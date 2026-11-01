export type UserRole = 'ADMIN' | 'VIEWER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

