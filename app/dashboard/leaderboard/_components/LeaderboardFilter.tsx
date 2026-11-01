'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface TeamOption {
  id: string;
  name: string;
  shortName: string;
}

interface LeaderboardFilterProps {
  teams: TeamOption[];
}

export function LeaderboardFilter({ teams }: LeaderboardFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRole = searchParams.get('role') || '';
  const currentTeamId = searchParams.get('teamId') || '';

  const applyFilters = (role: string, teamId: string) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (teamId) params.set('teamId', teamId);
    const qs = params.toString();
    router.push(`/dashboard/leaderboard${qs ? `?${qs}` : ''}`);
  };

  const handleReset = () => {
    router.push('/dashboard/leaderboard');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Role filter */}
      <div className="flex-1">
        <label
          htmlFor="filterRole"
          className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1"
        >
          Filter by Role
        </label>
        <select
          id="filterRole"
          value={currentRole}
          onChange={(e) => applyFilters(e.target.value, currentTeamId)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Roles</option>
          <option value="BATSMAN">Batsman</option>
          <option value="BOWLER">Bowler</option>
          <option value="ALL_ROUNDER">All-Rounder</option>
          <option value="WICKETKEEPER">Wicketkeeper</option>
        </select>
      </div>

      {/* Team filter */}
      <div className="flex-1">
        <label
          htmlFor="filterTeam"
          className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1"
        >
          Filter by Team
        </label>
        <select
          id="filterTeam"
          value={currentTeamId}
          onChange={(e) => applyFilters(currentRole, e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.shortName})
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      {(currentRole || currentTeamId) && (
        <div className="self-end sm:self-auto sm:pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

