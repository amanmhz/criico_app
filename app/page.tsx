import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

// Block prerendering — this route reads cookies to decide the redirect target
export const instant = false;

/**
 * Root route — redirects based on auth state:
 *   authenticated   → /dashboard
 *   unauthenticated → /login
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
