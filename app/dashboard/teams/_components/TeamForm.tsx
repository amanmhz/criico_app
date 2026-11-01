'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { teamsApi } from '@/lib/api/teams';
import { ApiError } from '@/lib/api/client';
import type { Team } from '@/types/team';

interface TeamFormProps {
  initialData?: Team;
  mode: 'create' | 'edit';
}

export function TeamForm({ initialData, mode }: TeamFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [shortName, setShortName] = useState(initialData?.shortName || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Team name is required');
      return;
    }

    if (!shortName.trim()) {
      setError('Short name is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        description: description.trim() || undefined,
      };

      if (mode === 'create') {
        await teamsApi.create(payload);
      } else if (initialData) {
        await teamsApi.update(initialData.id, payload);
      }

      router.push('/dashboard/teams');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving team.');
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

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Team Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mumbai Indians"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Short Name */}
        <div>
          <label
            htmlFor="shortName"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Short Name / Code * (Max 10 characters)
          </label>
          <input
            id="shortName"
            type="text"
            maxLength={10}
            required
            value={shortName}
            onChange={(e) => setShortName(e.target.value.toUpperCase())}
            placeholder="e.g. MI"
            className="w-full px-3.5 py-2.5 uppercase font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter brief background or history about the team..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/dashboard/teams"
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Team' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

