import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { AuthUser, UserRole } from '@/types/auth';

export const AUTH_COOKIE_NAME = 'auth_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 24 hours in seconds
};

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'cricket-management-super-secret-jwt-key-2026';
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    return {
      id: String(payload.id),
      name: String(payload.name ?? ''),
      email: String(payload.email),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

function extractTokenFromRequest(req: Request | NextRequest): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check NextRequest cookies if available
  if ('cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    const nextReq = req as NextRequest;
    const cookieToken =
      nextReq.cookies.get(AUTH_COOKIE_NAME)?.value ||
      nextReq.cookies.get('token')?.value;
    if (cookieToken) return cookieToken;
  }

  // 3. Fallback to parsing raw cookie header
  const rawCookie = req.headers.get('cookie');
  if (rawCookie) {
    const cookiesList = rawCookie.split(';');
    for (const cookieItem of cookiesList) {
      const [name, ...rest] = cookieItem.trim().split('=');
      const val = rest.join('=');
      if (name === AUTH_COOKIE_NAME || name === 'token') {
        return decodeURIComponent(val);
      }
    }
  }

  return null;
}

export async function getCurrentUser(req?: Request | NextRequest): Promise<AuthUser | null> {
  let token: string | null = null;

  if (req) {
    token = extractTokenFromRequest(req);
  } else {
    try {
      const cookieStore = await cookies();
      token =
        cookieStore.get(AUTH_COOKIE_NAME)?.value ||
        cookieStore.get('token')?.value ||
        null;
    } catch {
      // If called outside of a request context where cookies() throws
      token = null;
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

