'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { playersApi } from '@/lib/api/players';
import { ApiError } from '@/lib/api/client';
import type { Player, PlayerRole } from '@/types/player';

interface PlayerFormProps {
  initialData?: Player;
  mode: 'create' | 'edit';
}

export function PlayerForm({ initialData, mode }: PlayerFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState<PlayerRole>(initialData?.role || 'BATSMAN');
  const [basePrice, setBasePrice] = useState(initialData?.basePrice?.toString() || '10000');
  const [matchesPlayed, setMatchesPlayed] = useState(initialData?.matchesPlayed?.toString() || '0');
  const [totalRuns, setTotalRuns] = useState(initialData?.totalRuns?.toString() || '0');
  const [totalWickets, setTotalWickets] = useState(initialData?.totalWickets?.toString() || '0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(basePrice);
    const matchesNum = parseInt(matchesPlayed, 10);
    const runsNum = parseInt(totalRuns, 10);
    const wicketsNum = parseInt(totalWickets, 10);

    if (!name.trim()) {
      setError('Player name is required');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Base price must be a non-negative number');
      return;
    }

    if (isNaN(matchesNum) || matchesNum < 0) {
      setError('Matches played must be a non-negative integer');
      return;
    }

    if (isNaN(runsNum) || runsNum < 0) {
      setError('Total runs must be a non-negative integer');
      return;
    }

    if (isNaN(wicketsNum) || wicketsNum < 0) {
      setError('Total wickets must be a non-negative integer');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        role,
        basePrice: priceNum,
        matchesPlayed: matchesNum,
        totalRuns: runsNum,
        totalWickets: wicketsNum,
      };

      if (mode === 'create') {
        await playersApi.create(payload);
      } else if (initialData) {
        await playersApi.update(initialData.id, payload);
      }

      router.push('/dashboard/players');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving player.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Player Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Virat Kohli"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Role *
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as PlayerRole)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          >
            <option value="BATSMAN">Batsman</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All-Rounder</option>
            <option value="WICKETKEEPER">Wicketkeeper</option>
          </select>
        </div>

        {/* Base Price */}
        <div>
          <label
            htmlFor="basePrice"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Base Price ($) *
          </label>
          <input
            id="basePrice"
            type="number"
            min="0"
            step="100"
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Matches Played */}
        <div>
          <label
            htmlFor="matchesPlayed"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Matches Played
          </label>
          <input
            id="matchesPlayed"
            type="number"
            min="0"
            step="1"
            value={matchesPlayed}
            onChange={(e) => setMatchesPlayed(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Total Runs */}
        <div>
          <label
            htmlFor="totalRuns"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Total Runs
          </label>
          <input
            id="totalRuns"
            type="number"
            min="0"
            step="1"
            value={totalRuns}
            onChange={(e) => setTotalRuns(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Total Wickets */}
        <div>
          <label
            htmlFor="totalWickets"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Total Wickets
          </label>
          <input
            id="totalWickets"
            type="number"
            min="0"
            step="1"
            value={totalWickets}
            onChange={(e) => setTotalWickets(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/dashboard/players"
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Player' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

