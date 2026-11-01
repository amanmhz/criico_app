import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { teamRepository } from '@/lib/repositories/team.repository';
import { TeamFilter } from './_components/TeamFilter';
import { DeleteTeamButton } from './_components/DeleteTeamButton';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    name?: string;
  }>;
}

export default async function TeamsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const resolvedParams = await searchParams;
  const name = resolvedParams.name;

  const teams = await teamRepository.findAll({ name });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Cricket Teams
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse registered teams, squad rosters, and franchise details.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/teams/create"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition inline-flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <span>+ Create Team</span>
          </Link>
        )}
      </div>

      {/* Filter */}
      <TeamFilter />

      {/* Teams Grid / Cards */}
      {teams.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-xl font-bold mb-3">
            T
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No teams found
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {name ? 'Try a different team name.' : 'Start by creating your first cricket team.'}
          </p>
          {isAdmin && !name && (
            <div className="mt-4">
              <Link
                href="/dashboard/teams/create"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition inline-block"
              >
                Create Team
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const totalMatches =
              (team._count.teamAMatches || 0) + (team._count.teamBMatches || 0);

            return (
              <div
                key={team.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm tracking-wider uppercase">
                      {team.shortName.slice(0, 3)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {team.shortName}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/teams/${team.id}`}
                    className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {team.name}
                  </Link>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 min-h-[2rem]">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Squad Size:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      {team._count.players} players
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Matches:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      {totalMatches} matches
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/dashboard/teams/${team.id}/players`}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {isAdmin ? 'Manage Roster →' : 'View Roster →'}
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/teams/${team.id}`}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        Details
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href={`/dashboard/teams/${team.id}/edit`}
                            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteTeamButton teamId={team.id} teamName={team.name} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

