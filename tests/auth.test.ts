import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken, getCurrentUser } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/auth';
import type { AuthUser } from '@/types/auth';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { NextRequest } from 'next/server';

describe('Authentication & Password Handling', () => {
  it('hashes passwords and verifies correctly', async () => {
    const password = 'mySecretPassword123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrongPassword', hash)).toBe(false);
  });

  it('validates login input with Zod', () => {
    const valid = loginSchema.safeParse({
      email: 'admin@cricket.com',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(invalidEmail.success).toBe(false);

    const emptyPassword = loginSchema.safeParse({
      email: 'admin@cricket.com',
      password: '',
    });
    expect(emptyPassword.success).toBe(false);
  });

  it('generates and verifies valid JWT with user role', async () => {
    const user: AuthUser = {
      id: 'user_123',
      name: 'Admin User',
      email: 'admin@cricket.com',
      role: 'ADMIN',
    };

    const token = await signToken(user);
    expect(typeof token).toBe('string');

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);
    expect(verified?.email).toBe(user.email);
    expect(verified?.role).toBe('ADMIN');
  });

  it('rejects an invalid or tampered JWT', async () => {
    const verified = await verifyToken('invalid.token.string');
    expect(verified).toBeNull();
  });

  it('extracts current user from Bearer authorization header', async () => {
    const user: AuthUser = {
      id: 'viewer_123',
      name: 'Viewer User',
      email: 'viewer@cricket.com',
      role: 'VIEWER',
    };
    const token = await signToken(user);

    const req = new Request('http://localhost:3000/api/auth/me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const currentUser = await getCurrentUser(req);
    expect(currentUser).not.toBeNull();
    expect(currentUser?.id).toBe('viewer_123');
    expect(currentUser?.role).toBe('VIEWER');
  });

  it('extracts current user from cookie header', async () => {
    const user: AuthUser = {
      id: 'admin_456',
      name: 'Admin Two',
      email: 'admin2@cricket.com',
      role: 'ADMIN',
    };
    const token = await signToken(user);

    const req = new Request('http://localhost:3000/api/auth/me', {
      headers: {
        cookie: `auth_token=${token}`,
      },
    });

    const currentUser = await getCurrentUser(req);
    expect(currentUser).not.toBeNull();
    expect(currentUser?.id).toBe('admin_456');
    expect(currentUser?.role).toBe('ADMIN');
  });
});

describe('Auth API Routes', () => {
  it('POST /api/auth/login validates body and returns 400 on invalid input', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: '123' }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('POST /api/auth/login returns 401 for unknown user', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@example.com', password: 'password123' }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid email or password');
  });

  it('POST /api/auth/login logs in seeded admin and sets auth cookie', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cricket.com', password: 'admin123' }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe('admin@cricket.com');
    expect(data.user.role).toBe('ADMIN');

    // Verify cookie was set
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('auth_token=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('GET /api/auth/me returns 401 when unauthenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/me');
    const res = await meHandler(req);
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns current user when authenticated', async () => {
    const user: AuthUser = {
      id: 'admin_test_id',
      name: 'Admin Test',
      email: 'admin_test@cricket.com',
      role: 'ADMIN',
    };
    const token = await signToken(user);

    const req = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const res = await meHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe('admin_test_id');
    expect(data.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/logout clears auth cookie', async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('Max-Age=0');
  });
});

