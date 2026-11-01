import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { teamRepository } from '@/lib/repositories/team.repository';
import { teamPlayerRepository } from '@/lib/repositories/teamPlayer.repository';
import { RemovePlayerButton } from './_components/RemovePlayerButton';
import { AddPlayerForm } from './_components/AddPlayerForm';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPlayersPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const team = await teamRepository.findById(id);
  if (!team) {
    notFound();
  }

  const [teamRoster, availablePlayers] = await Promise.all([
    teamPlayerRepository.findByTeam(id),
    isAdmin ? teamPlayerRepository.findAvailablePlayers(id) : Promise.resolve([]),
  ]);

  const roleBadgeColor: Record<string, string> = {
    BATSMAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    BOWLER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    ALL_ROUNDER: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    WICKETKEEPER: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={`/dashboard/teams/${team.id}`}
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          &larr; Back to {team.name}
        </Link>
        <span className="text-xs text-zinc-400">
          Viewing mode: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{user?.role}</span>
        </span>
      </div>

      {/* Team Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {team.name} Squad Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {team.shortName}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Total active squad members: <span className="font-bold text-zinc-900 dark:text-zinc-100">{teamRoster.length}</span>
          </p>
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {isAdmin ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
              ✓ Roster Editing Enabled
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Read-Only View
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Squad Players List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Assigned Squad Members ({teamRoster.length})
              </h2>
            </div>

            {teamRoster.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                <p className="text-sm">No players are currently assigned to this team.</p>
                {isAdmin && (
                  <p className="text-xs text-zinc-400 mt-1">
                    Use the form on the right to assign players to the squad.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase font-semibold text-zinc-500">
                    <tr>
                      <th className="px-5 py-3">Player</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3 text-center">Matches</th>
                      <th className="px-3 py-3 text-center">Runs</th>
                      <th className="px-3 py-3 text-center">Wickets</th>
                      {isAdmin && <th className="px-5 py-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {teamRoster.map(({ player, joinedAt }) => (
                      <tr
                        key={player.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/dashboard/players/${player.id}`}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          >
                            {player.name}
                          </Link>
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            Joined {new Date(joinedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              roleBadgeColor[player.role] || 'bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            {player.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono text-zinc-700 dark:text-zinc-300">
                          {player.matchesPlayed}
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono text-zinc-700 dark:text-zinc-300">
                          {player.totalRuns}
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono text-zinc-700 dark:text-zinc-300">
                          {player.totalWickets}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <RemovePlayerButton
                              teamId={team.id}
                              playerId={player.id}
                              playerName={player.name}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Add Player to Squad (Admin Only) or Roster Summary (Viewer) */}
        <div className="space-y-4">
          {isAdmin ? (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                Assign Player to Squad
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Select an unassigned player to join {team.shortName}.
              </p>
              <AddPlayerForm
                teamId={team.id}
                availablePlayers={availablePlayers}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Squad Information
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                As a standard viewer, you can inspect player roster assignments, member stats, and team details. Only administrators are authorized to add or remove players from the squad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

