import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { teamRepository } from '@/lib/repositories/team.repository';
import { DeleteTeamButton } from '../_components/DeleteTeamButton';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const team = await teamRepository.findById(id);
  if (!team) {
    notFound();
  }

  const totalMatches =
    (team._count.teamAMatches || 0) + (team._count.teamBMatches || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/dashboard/teams"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          &larr; Back to all teams
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/teams/${team.id}/players`}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition"
          >
            {isAdmin ? 'Manage Squad Roster' : 'View Full Squad'}
          </Link>

          {isAdmin && (
            <>
              <Link
                href={`/dashboard/teams/${team.id}/edit`}
                className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition"
              >
                Edit Team
              </Link>
              <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <DeleteTeamButton teamId={team.id} teamName={team.name} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Team Header Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl tracking-wider uppercase">
              {team.shortName.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {team.name}
                </h1>
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {team.shortName}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Team ID: <span className="font-mono">{team.id}</span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 text-left sm:text-right">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Squad Size
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {team.players.length} players
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Matches
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalMatches}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Team Overview
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {team.description || 'No detailed description provided for this team.'}
          </p>
        </div>
      </div>

      {/* Current Squad Roster */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Current Squad Roster ({team.players.length})
          </h2>
          <Link
            href={`/dashboard/teams/${team.id}/players`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {isAdmin ? '+ Add or Remove Players' : 'View Full Roster'}
          </Link>
        </div>

        {team.players.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No players currently assigned to this team.
            </p>
            {isAdmin && (
              <Link
                href={`/dashboard/teams/${team.id}/players`}
                className="mt-3 inline-block px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Assign Players
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Matches</th>
                  <th className="px-4 py-3 text-center">Runs</th>
                  <th className="px-4 py-3 text-center">Wickets</th>
                  <th className="px-4 py-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {team.players.map(({ player, joinedAt }) => (
                  <tr key={player.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      <Link
                        href={`/dashboard/players/${player.id}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                      {player.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {player.matchesPlayed}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {player.totalRuns}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {player.totalWickets}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">
                      {new Date(joinedAt).toLocaleDateString()}
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

