import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { playerRepository } from '@/lib/repositories/player.repository';
import type { PlayerRole } from '@prisma/client';
import { PlayerFilter } from './_components/PlayerFilter';
import { DeletePlayerButton } from './_components/DeletePlayerButton';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    name?: string;
    role?: string;
  }>;
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const resolvedParams = await searchParams;
  const name = resolvedParams.name;
  const role = resolvedParams.role as PlayerRole | undefined;

  const players = await playerRepository.findAll({ name, role });

  const roleBadgeColor: Record<string, string> = {
    BATSMAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    BOWLER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    ALL_ROUNDER: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    WICKETKEEPER: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Player Directory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage and view cricket players, their roles, base prices, and career stats.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/players/create"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition inline-flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <span>+ Create Player</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <PlayerFilter />

      {/* Players Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {players.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-xl font-bold mb-3">
              ?
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No players found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {name || role
                ? 'Try adjusting your search filters to find players.'
                : 'Get started by creating your first player.'}
            </p>
            {isAdmin && !name && !role && (
              <div className="mt-4">
                <Link
                  href="/dashboard/players/create"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition inline-block"
                >
                  Create Player
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Player</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Base Price</th>
                  <th className="px-4 py-3.5 text-center">Matches</th>
                  <th className="px-4 py-3.5 text-center">Runs</th>
                  <th className="px-4 py-3.5 text-center">Wickets</th>
                  <th className="px-4 py-3.5 text-center">Teams</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {players.map((player) => (
                  <tr
                    key={player.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/players/${player.id}`}
                        className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          roleBadgeColor[player.role] || 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {player.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-zinc-700 dark:text-zinc-300">
                      ${player.basePrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {player.matchesPlayed}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {player.totalRuns}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      {player.totalWickets}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {player._count.teams}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <Link
                        href={`/dashboard/players/${player.id}`}
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href={`/dashboard/players/${player.id}/edit`}
                            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition"
                          >
                            Edit
                          </Link>
                          <DeletePlayerButton
                            playerId={player.id}
                            playerName={player.name}
                          />
                        </>
                      )}
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

