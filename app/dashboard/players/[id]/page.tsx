import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { playerRepository } from '@/lib/repositories/player.repository';
import { DeletePlayerButton } from '../_components/DeletePlayerButton';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const player = await playerRepository.findById(id);
  if (!player) {
    notFound();
  }

  const roleBadgeColor: Record<string, string> = {
    BATSMAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    BOWLER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    ALL_ROUNDER: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    WICKETKEEPER: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/dashboard/players"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          &larr; Back to all players
        </Link>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/players/${player.id}/edit`}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition"
            >
              Edit Player
            </Link>
            <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <DeletePlayerButton playerId={player.id} playerName={player.name} />
            </div>
          </div>
        )}
      </div>

      {/* Main Player Profile Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {player.name}
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                  roleBadgeColor[player.role] || 'bg-zinc-100 text-zinc-800'
                }`}
              >
                {player.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Player ID: <span className="font-mono text-xs">{player.id}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Base Price
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ${player.basePrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Matches Played
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {player.matchesPlayed}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Runs
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {player.totalRuns}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Wickets
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {player.totalWickets}
            </div>
          </div>
        </div>
      </div>

      {/* Associated Teams */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Team Memberships ({player.teams.length})
        </h2>

        {player.teams.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This player is not currently assigned to any team.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {player.teams.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/dashboard/teams/${item.team.id}`}
                    className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {item.team.name}
                  </Link>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Code: {item.team.shortName}
                  </div>
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  Joined {new Date(item.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Performances */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Match Performances ({player.performances.length})
        </h2>

        {player.performances.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No match performance records recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Match Date</th>
                  <th className="px-4 py-3">Represented Team</th>
                  <th className="px-4 py-3 text-center">Runs</th>
                  <th className="px-4 py-3 text-center">Wickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {player.performances.map((perf) => (
                  <tr key={perf.id}>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {new Date(perf.match.playedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {perf.team.name}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {perf.runs}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {perf.wickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

