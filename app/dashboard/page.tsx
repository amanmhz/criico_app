import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const instant = false;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Logged in as{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {user.email}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
              }`}
            >
              Role: {user.role}
            </span>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Authentication Status
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Phase 3 Authentication and Role-Based Authorization is active. Your session is protected with an HTTP-only JWT cookie.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1">
            <div>User ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>Admin Privileges: {user.role === 'ADMIN' ? 'YES (Full Access)' : 'NO (Read-Only)'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
