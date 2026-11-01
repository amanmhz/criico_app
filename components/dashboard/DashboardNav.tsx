'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AuthUser } from '@/types/auth';
import { SignOutButton } from '@/app/dashboard/_components/SignOutButton';

interface DashboardNavProps {
  user: AuthUser;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Players', href: '/dashboard/players' },
    { label: 'Teams', href: '/dashboard/teams' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-50 font-bold text-lg"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
                CR
              </span>
              <span>Cricket Manager</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User Role Badge + User Info + SignOutButton */}
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
              }`}
            >
              {user.role}
            </span>

            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {user.name}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {user.email}
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center space-x-2 py-2 border-t border-zinc-100 dark:border-zinc-800/60 overflow-x-auto">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

