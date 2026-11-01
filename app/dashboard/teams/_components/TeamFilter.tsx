'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function TeamFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentName = searchParams.get('name') || '';
  const [name, setName] = useState(currentName);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (name.trim()) params.set('name', name.trim());
    const query = params.toString();
    router.push(`/dashboard/teams${query ? `?${query}` : ''}`);
  };

  const handleReset = () => {
    setName('');
    router.push('/dashboard/teams');
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
    >
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search teams by name..."
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
        >
          Search
        </button>
        {(currentName || name) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
}

