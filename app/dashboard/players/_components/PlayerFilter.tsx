'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function PlayerFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentName = searchParams.get('name') || '';
  const currentRole = searchParams.get('role') || '';

  const [name, setName] = useState(currentName);
  const [role, setRole] = useState(currentRole);

  const applyFilters = (nameVal: string, roleVal: string) => {
    const params = new URLSearchParams();
    if (nameVal.trim()) params.set('name', nameVal.trim());
    if (roleVal) params.set('role', roleVal);

    const query = params.toString();
    router.push(`/dashboard/players${query ? `?${query}` : ''}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(name, role);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    applyFilters(name, newRole);
  };

  const handleReset = () => {
    setName('');
    setRole('');
    router.push('/dashboard/players');
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
          placeholder="Search players by name..."
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <div className="w-full sm:w-48">
        <select
          value={role}
          onChange={handleRoleChange}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="">All Roles</option>
          <option value="BATSMAN">Batsman</option>
          <option value="BOWLER">Bowler</option>
          <option value="ALL_ROUNDER">All-Rounder</option>
          <option value="WICKETKEEPER">Wicketkeeper</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
        >
          Search
        </button>
        {(currentName || currentRole || name || role) && (
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

