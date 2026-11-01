'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamPlayersApi } from '@/lib/api/teamPlayers';
import { ApiError } from '@/lib/api/client';

interface RemovePlayerButtonProps {
  teamId: string;
  playerId: string;
  playerName: string;
}

export function RemovePlayerButton({
  teamId,
  playerId,
  playerName,
}: RemovePlayerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      await teamPlayersApi.remove(teamId, playerId);
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to remove player from team.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition"
      >
        Remove
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Remove from Team
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Remove{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {playerName}
              </span>{' '}
              from this team roster? The player record itself and past match stats will NOT be deleted.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setError(null);
                }}
                disabled={loading}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

