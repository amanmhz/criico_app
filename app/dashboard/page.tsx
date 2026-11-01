import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { leaderboardService } from '@/lib/services/leaderboard.service';

export const instant = false;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [playersCount, teamsCount, matchesCount, topPlayers, recentTeams, recentMatches] =
    await Promise.all([
      prisma.player.count(),
      prisma.team.count(),
      prisma.match.count(),
      leaderboardService.getLeaderboard(),
      prisma.team.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { players: true },
          },
        },
      }),
      prisma.match.findMany({
        take: 4,
        orderBy: { playedAt: 'desc' },
        include: {
          teamA: true,
          teamB: true,
          _count: {
            select: { performances: true },
          },
        },
      }),
    ]);

  const top5Players = topPlayers.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Current system role:{' '}
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
              }`}
            >
              {user?.role}
            </span>
            {' — '}
            {isAdmin
              ? 'Administrator privileges active: you can create, modify, and delete players, teams, and matches.'
              : 'Viewer mode active: you have read-only access across statistics, rosters, and match scorecards.'}
          </p>
        </div>

        {/* Quick Management Shortcuts for Admin */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/players/create"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              + Add Player
            </Link>
            <Link
              href="/dashboard/teams/create"
              className="px-3.5 py-2 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-semibold shadow-sm transition"
            >
              + Add Team
            </Link>
            <Link
              href="/dashboard/matches/create"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              + Record Match
            </Link>
          </div>
        )}
      </div>

      {/* Metric Cards (Total Players, Total Teams, Total Matches) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Players
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
              {playersCount}
            </div>
            <Link
              href="/dashboard/players"
              className="inline-block mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View Player Directory &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl">
            P
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Teams
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
              {teamsCount}
            </div>
            <Link
              href="/dashboard/teams"
              className="inline-block mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Team Rosters &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl">
            T
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Matches
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
              {matchesCount}
            </div>
            <Link
              href="/dashboard/matches"
              className="inline-block mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Match Fixtures &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl">
            M
          </div>
        </div>
      </div>

      {/* Split Section: Top-Ranked Players & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top-Ranked Players Preview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Top-Ranked Players
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">By statistical Impact Score</p>
              </div>
              <Link
                href="/dashboard/leaderboard"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Full Leaderboard &rarr;
              </Link>
            </div>

            {top5Players.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No player statistics recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {top5Players.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                        {player.rank}
                      </span>
                      <div>
                        <Link
                          href={`/dashboard/players/${player.id}`}
                          className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 transition"
                        >
                          {player.name}
                        </Link>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {player.role.replace('_', ' ')} • {player.matchesPlayed} matches
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {player.impactScore} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Recent Matches
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Latest recorded cricket fixtures</p>
              </div>
              <Link
                href="/dashboard/matches"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                All Matches &rarr;
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No match fixtures recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <div>
                      <div className="text-xs text-zinc-400">
                        {new Date(m.playedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {m.teamA.name} <span className="text-zinc-400 font-normal">vs</span> {m.teamB.name}
                      </div>
                      {m.result && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {m.result}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/matches/${m.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                      Scorecard
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Created Teams */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Registered Franchises & Teams
          </h2>
          <Link
            href="/dashboard/teams"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            All Teams &rarr;
          </Link>
        </div>

        {recentTeams.length === 0 ? (
          <p className="text-xs text-zinc-500">No teams registered in the system yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTeams.map((team) => (
              <div
                key={team.id}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    <Link
                      href={`/dashboard/teams/${team.id}`}
                      className="hover:text-emerald-600 transition"
                    >
                      {team.name}
                    </Link>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {team._count.players} players in squad
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {team.shortName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
