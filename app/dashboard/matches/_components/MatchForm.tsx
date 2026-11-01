'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { matchesApi } from '@/lib/api/matches';
import { ApiError } from '@/lib/api/client';
import { useToast } from '@/app/_components/ToastProvider';
import type { MatchDetail } from '@/types/match';

interface TeamWithRoster {
  id: string;
  name: string;
  shortName: string;
  players: {
    player: {
      id: string;
      name: string;
      role: string;
    };
  }[];
}

interface MatchFormProps {
  availableTeams: TeamWithRoster[];
  initialData?: MatchDetail;
  mode: 'create' | 'edit';
}

export function MatchForm({ availableTeams, initialData, mode }: MatchFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [teamAId, setTeamAId] = useState(initialData?.teamAId || '');
  const [teamBId, setTeamBId] = useState(initialData?.teamBId || '');
  const [playedAt, setPlayedAt] = useState(
    initialData?.playedAt
      ? new Date(initialData.playedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [result, setResult] = useState(initialData?.result || '');

  // Performance state map: key is playerId
  const [performanceMap, setPerformanceMap] = useState<
    Record<string, { participated: boolean; runs: number; wickets: number; teamId: string }>
  >(() => {
    const initialMap: Record<
      string,
      { participated: boolean; runs: number; wickets: number; teamId: string }
    > = {};
    if (initialData?.performances) {
      for (const p of initialData.performances) {
        initialMap[p.playerId] = {
          participated: true,
          runs: p.runs,
          wickets: p.wickets,
          teamId: p.teamId,
        };
      }
    }
    return initialMap;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamA = availableTeams.find((t) => t.id === teamAId);
  const teamB = availableTeams.find((t) => t.id === teamBId);

  const handlePerformanceChange = (
    playerId: string,
    teamId: string,
    field: 'participated' | 'runs' | 'wickets',
    value: boolean | number
  ) => {
    setPerformanceMap((prev) => {
      const current = prev[playerId] || {
        participated: false,
        runs: 0,
        wickets: 0,
        teamId,
      };

      return {
        ...prev,
        [playerId]: {
          ...current,
          teamId,
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamAId || !teamBId) {
      const msg = 'Please select both Team A and Team B.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (teamAId === teamBId) {
      const msg = 'Team A and Team B must be different teams.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!playedAt) {
      const msg = 'Match date is required.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Build performances payload
    const performances: { playerId: string; teamId: string; runs: number; wickets: number }[] = [];
    for (const [playerId, data] of Object.entries(performanceMap)) {
      if (data.participated) {
        performances.push({
          playerId,
          teamId: data.teamId,
          runs: Number(data.runs) || 0,
          wickets: Number(data.wickets) || 0,
        });
      }
    }

    setLoading(true);

    try {
      const payload = {
        teamAId,
        teamBId,
        playedAt: new Date(playedAt),
        result: result.trim() || undefined,
        performances,
      };

      if (mode === 'create') {
        await matchesApi.create(payload);
        toast.success('Match created successfully!');
      } else if (initialData) {
        await matchesApi.update(initialData.id, payload);
        toast.success('Match updated successfully!');
      }

      router.push('/dashboard/matches');
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred while saving the match.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Match Setup Details */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          1. Match Fixture & Schedule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Team A */}
          <div>
            <label
              htmlFor="teamA"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Team A *
            </label>
            <select
              id="teamA"
              required
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Team A --</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === teamBId}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Team B */}
          <div>
            <label
              htmlFor="teamB"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Team B *
            </label>
            <select
              id="teamB"
              required
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Team B --</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="playedAt"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Match Date *
            </label>
            <input
              id="playedAt"
              type="date"
              required
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Match Result */}
          <div>
            <label
              htmlFor="result"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Match Outcome / Result (Optional)
            </label>
            <input
              id="result"
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. Mumbai Indians won by 5 wickets"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Player Performances Section */}
      {teamA && teamB && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                2. Player Performances
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Check each player who participated in the match and enter their runs and wickets.
              </p>
            </div>
          </div>

          {/* Team A Roster */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Team A Squad: {teamA.name} ({teamA.players.length} registered players)
              </span>
            </div>

            {teamA.players.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No players assigned to {teamA.name}. Assign players in Team Management first.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">Played?</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 w-36">Runs Scored</th>
                      <th className="px-4 py-3 w-36">Wickets Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {teamA.players.map(({ player }) => {
                      const perf = performanceMap[player.id] || {
                        participated: false,
                        runs: 0,
                        wickets: 0,
                        teamId: teamA.id,
                      };

                      return (
                        <tr
                          key={player.id}
                          className={perf.participated ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={perf.participated}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamA.id,
                                  'participated',
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {player.name}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {player.role.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              disabled={!perf.participated}
                              value={perf.runs}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamA.id,
                                  'runs',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              disabled={!perf.participated}
                              value={perf.wickets}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamA.id,
                                  'wickets',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Team B Roster */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Team B Squad: {teamB.name} ({teamB.players.length} registered players)
              </span>
            </div>

            {teamB.players.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No players assigned to {teamB.name}. Assign players in Team Management first.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">Played?</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 w-36">Runs Scored</th>
                      <th className="px-4 py-3 w-36">Wickets Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {teamB.players.map(({ player }) => {
                      const perf = performanceMap[player.id] || {
                        participated: false,
                        runs: 0,
                        wickets: 0,
                        teamId: teamB.id,
                      };

                      return (
                        <tr
                          key={player.id}
                          className={perf.participated ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={perf.participated}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamB.id,
                                  'participated',
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {player.name}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {player.role.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              disabled={!perf.participated}
                              value={perf.runs}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamB.id,
                                  'runs',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              disabled={!perf.participated}
                              value={perf.wickets}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  player.id,
                                  teamB.id,
                                  'wickets',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Submission */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/dashboard/matches"
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || !teamAId || !teamBId}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Saving Match...' : mode === 'create' ? 'Record Match & Stats' : 'Update Match Record'}
        </button>
      </div>
    </form>
  );
}
