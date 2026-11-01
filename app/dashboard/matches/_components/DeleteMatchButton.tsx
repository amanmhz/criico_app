'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchesApi } from '@/lib/api/matches';
import { ApiError } from '@/lib/api/client';
import { useToast } from '@/app/_components/ToastProvider';

interface DeleteMatchButtonProps {
  matchId: string;
  matchTitle: string;
}

export function DeleteMatchButton({ matchId, matchTitle }: DeleteMatchButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await matchesApi.delete(matchId);
      toast.success(`Match "${matchTitle}" deleted successfully.`);
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Failed to delete match. Please try again.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition"
      >
        Delete
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Delete Match
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {matchTitle}
              </span>
              ? All player career statistics credited from this match will automatically be reverted.
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
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

