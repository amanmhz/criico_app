'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authApi.logout(router);
    } catch {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

