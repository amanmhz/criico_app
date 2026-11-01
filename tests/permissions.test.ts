import { describe, it, expect } from 'vitest';
import {
  requireAuth,
  requireRole,
  requireAdmin,
  isAdmin,
  isViewer,
  canManage,
  canView,
  hasRole,
  AuthError,
} from '@/lib/permissions';
import { signToken } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

describe('Role-Based Authorization Helpers', () => {
  const adminUser: AuthUser = {
    id: 'admin_1',
    name: 'Admin User',
    email: 'admin@cricket.com',
    role: 'ADMIN',
  };

  const viewerUser: AuthUser = {
    id: 'viewer_1',
    name: 'Viewer User',
    email: 'viewer@cricket.com',
    role: 'VIEWER',
  };

  it('correctly checks role flags for ADMIN', () => {
    expect(isAdmin(adminUser)).toBe(true);
    expect(isViewer(adminUser)).toBe(false);
    expect(canManage(adminUser)).toBe(true);
    expect(canView(adminUser)).toBe(true);
    expect(hasRole(adminUser, 'ADMIN')).toBe(true);
    expect(hasRole(adminUser, 'VIEWER')).toBe(false);
  });

  it('correctly checks role flags for VIEWER', () => {
    expect(isAdmin(viewerUser)).toBe(false);
    expect(isViewer(viewerUser)).toBe(true);
    expect(canManage(viewerUser)).toBe(false); // VIEWER cannot perform admin actions
    expect(canView(viewerUser)).toBe(true);   // VIEWER has read-only access
    expect(hasRole(viewerUser, 'ADMIN')).toBe(false);
    expect(hasRole(viewerUser, 'VIEWER')).toBe(true);
  });

  it('requireAuth passes for authenticated user and fails for unauthenticated', async () => {
    const token = await signToken(viewerUser);
    const authedReq = new Request('http://localhost:3000/api/players', {
      headers: { authorization: `Bearer ${token}` },
    });

    const user = await requireAuth(authedReq);
    expect(user.id).toBe(viewerUser.id);

    const unauthedReq = new Request('http://localhost:3000/api/players');
    await expect(requireAuth(unauthedReq)).rejects.toThrow(AuthError);
  });

  it('requireAdmin grants access to ADMIN and throws 403 for VIEWER', async () => {
    const adminToken = await signToken(adminUser);
    const adminReq = new Request('http://localhost:3000/api/players', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const authedAdmin = await requireAdmin(adminReq);
    expect(authedAdmin.role).toBe('ADMIN');

    const viewerToken = await signToken(viewerUser);
    const viewerReq = new Request('http://localhost:3000/api/players', {
      method: 'POST',
      headers: { authorization: `Bearer ${viewerToken}` },
    });

    try {
      await requireAdmin(viewerReq);
      expect.fail('Should have thrown AuthError for viewer');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthError);
      if (err instanceof AuthError) {
        expect(err.status).toBe(403);
        expect(err.message).toContain('Forbidden');
      }
    }
  });

  it('requireRole allows allowed roles and forbids others', async () => {
    const viewerToken = await signToken(viewerUser);
    const viewerReq = new Request('http://localhost:3000/api/players', {
      headers: { authorization: `Bearer ${viewerToken}` },
    });

    // Allowed: VIEWER or ADMIN
    const result = await requireRole(['ADMIN', 'VIEWER'], viewerReq);
    expect(result.id).toBe(viewerUser.id);

    // Only ADMIN allowed: should throw 403
    await expect(requireRole(['ADMIN'], viewerReq)).rejects.toThrow(AuthError);
  });
});
