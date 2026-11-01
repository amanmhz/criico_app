import Link from 'next/link';
import { leaderboardService } from '@/lib/services/leaderboard.service';
import { teamRepository } from '@/lib/repositories/team.repository';
import type { PlayerRole } from '@prisma/client';
import { LeaderboardFilter } from './_components/LeaderboardFilter';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    role?: string;
    teamId?: string;
  }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const role = resolvedParams.role as PlayerRole | undefined;
  const teamId = resolvedParams.teamId;

  const [leaderboard, teams] = await Promise.all([
    leaderboardService.getLeaderboard({ role, teamId }),
    teamRepository.findAll(),
  ]);

  const roleBadgeColor: Record<string, string> = {
    BATSMAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    BOWLER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    ALL_ROUNDER: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    WICKETKEEPER: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-black flex items-center justify-center text-xs shadow-sm">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-400 text-zinc-950 font-black flex items-center justify-center text-xs shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs shadow-sm">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold flex items-center justify-center text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Player Impact Leaderboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time player performance rankings calculated using statistical impact formulas.
        </p>
      </div>

      {/* Filter Bar */}
      <LeaderboardFilter
        teams={teams.map((t) => ({ id: t.id, name: t.name, shortName: t.shortName }))}
      />

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No players found
            </h3>
            <p className="text-sm mt-1">
              Try adjusting the filter options to view ranked players.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5 w-16 text-center">Rank</th>
                  <th className="px-5 py-3.5">Player</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Teams</th>
                  <th className="px-4 py-3.5 text-center">Matches</th>
                  <th className="px-4 py-3.5 text-center">Runs</th>
                  <th className="px-4 py-3.5 text-center">Wickets</th>
                  <th className="px-6 py-3.5 text-right font-black">Impact Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {leaderboard.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition ${
                      item.rank === 1
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : item.rank === 2
                        ? 'bg-zinc-50/50 dark:bg-zinc-800/20'
                        : item.rank === 3
                        ? 'bg-orange-50/20 dark:bg-orange-950/10'
                        : ''
                    }`}
                  >
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/players/${item.id}`}
                        className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          roleBadgeColor[item.role] || 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {item.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.teams.length === 0 ? (
                          <span className="text-xs text-zinc-400">None</span>
                        ) : (
                          item.teams.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              {t.shortName}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {item.matchesPlayed}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {item.totalRuns}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {item.totalWickets}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-lg font-mono font-bold text-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.impactScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
        <div className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
          How Impact Score Is Calculated:
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-zinc-800 dark:text-zinc-200">Base Score:</strong> (Runs × 1.2) + (Wickets × 20)
          </li>
          <li>
            <strong className="text-zinc-800 dark:text-zinc-200">Role Multipliers:</strong> Bowler (Wickets × 1.5), Batsman (Runs × 1.3), Wicketkeeper (+30 bonus points).
          </li>
          <li>
            <strong className="text-zinc-800 dark:text-zinc-200">Experience Adjustments:</strong> &lt; 5 matches (-50 penalty), &gt; 20 matches (+100 veteran bonus).
          </li>
        </ul>
      </div>
    </div>
  );
}

