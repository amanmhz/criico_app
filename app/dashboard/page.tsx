import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const instant = false;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [playersCount, teamsCount] = await Promise.all([
    prisma.player.count(),
    prisma.team.count(),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          You are signed in with the{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">
            {user?.role}
          </span>{' '}
          role.{' '}
          {user?.role === 'ADMIN'
            ? 'You have full access to manage players, teams, and rosters.'
            : 'You have read-only access to view application data.'}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Players
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {playersCount}
            </div>
            <Link
              href="/dashboard/players"
              className="inline-block mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all players &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            P
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Teams
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {teamsCount}
            </div>
            <Link
              href="/dashboard/teams"
              className="inline-block mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all teams &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-400 flex items-center justify-center font-bold text-xl">
            T
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Permissions
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              {user?.role === 'ADMIN' ? 'Full Access' : 'Read Only'}
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {user?.role === 'ADMIN'
                ? 'Create, edit & delete enabled'
                : 'Administrative actions disabled'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
            R
          </div>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/players/create"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition inline-flex items-center space-x-2"
            >
              <span>+ Create Player</span>
            </Link>
            <Link
              href="/dashboard/teams/create"
              className="px-4 py-2 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-medium transition inline-flex items-center space-x-2"
            >
              <span>+ Create Team</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
