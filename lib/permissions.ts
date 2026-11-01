import type { NextRequest } from 'next/server';
import type { AuthUser, UserRole } from '@/types/auth';
import { getCurrentUser } from '@/lib/auth';

export { getCurrentUser };

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Ensures a user is authenticated.
 * Returns the authenticated user or throws an AuthError (401).
 */
export async function requireAuth(req?: Request | NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new AuthError('Authentication required. Please log in.', 401);
  }
  return user;
}

/**
 * Ensures the authenticated user has one of the allowed roles.
 * Returns the user or throws an AuthError (401 if unauthenticated, 403 if forbidden).
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  req?: Request | NextRequest
): Promise<AuthUser> {
  const user = await requireAuth(req);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    throw new AuthError('Forbidden: You do not have permission to perform this action.', 403);
  }

  return user;
}

/**
 * Ensures the authenticated user has the ADMIN role.
 * Returns the user or throws an AuthError (401 if unauthenticated, 403 if not ADMIN).
 */
export async function requireAdmin(req?: Request | NextRequest): Promise<AuthUser> {
  return requireRole('ADMIN', req);
}

/**
 * Synchronous permission check helpers.
 */
export function isAdmin(user?: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}

export function isViewer(user?: AuthUser | null): boolean {
  return user?.role === 'VIEWER';
}

export function canManage(user?: AuthUser | null): boolean {
  return isAdmin(user);
}

export function canView(user?: AuthUser | null): boolean {
  return Boolean(user && (user.role === 'ADMIN' || user.role === 'VIEWER'));
}

export function hasRole(user: AuthUser | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

