'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamPlayersApi } from '@/lib/api/teamPlayers';
import { ApiError } from '@/lib/api/client';
import type { Player } from '@/types/player';

interface AddPlayerFormProps {
  teamId: string;
  availablePlayers: Player[];
}

export function AddPlayerForm({ teamId, availablePlayers }: AddPlayerFormProps) {
  const router = useRouter();

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter available players by search filter
  const filteredPlayers = availablePlayers.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const selectedPlayer = availablePlayers.find((p) => p.id === selectedPlayerId);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      setError('Please choose a player to add.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await teamPlayersApi.add(teamId, selectedPlayerId);
      setSuccess(`Player "${selectedPlayer?.name}" added to squad successfully!`);
      setSelectedPlayerId('');
      setSearchFilter('');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to add player to team.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (availablePlayers.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
        All available players in the system are already assigned to this squad.
      </div>
    );
  }

  return (
    <form onSubmit={handleAdd} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="searchFilter"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
        >
          1. Quick Filter Available Players
        </label>
        <input
          id="searchFilter"
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter by name..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label
          htmlFor="selectPlayer"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
        >
          2. Select Player to Assign ({filteredPlayers.length} available)
        </label>
        <select
          id="selectPlayer"
          value={selectedPlayerId}
          onChange={(e) => {
            setSelectedPlayerId(e.target.value);
            setError(null);
          }}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">-- Choose a player --</option>
          {filteredPlayers.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} ({player.role.replace('_', ' ')}) — ${player.basePrice.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {selectedPlayer && (
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            Selected: {selectedPlayer.name}
          </div>
          <div className="text-zinc-600 dark:text-zinc-400">
            Role: {selectedPlayer.role.replace('_', ' ')} | Matches: {selectedPlayer.matchesPlayed} | Runs: {selectedPlayer.totalRuns} | Wickets: {selectedPlayer.totalWickets}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedPlayerId}
        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 shadow-sm"
      >
        {loading ? 'Assigning Player...' : '+ Add Player to Squad'}
      </button>
    </form>
  );
}

