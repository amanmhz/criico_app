import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { matchRepository } from '@/lib/repositories/match.repository';
import { teamRepository } from '@/lib/repositories/team.repository';
import { DeleteMatchButton } from './_components/DeleteMatchButton';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    teamId?: string;
  }>;
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const resolvedParams = await searchParams;
  const teamId = resolvedParams.teamId;

  const [matches, teams] = await Promise.all([
    matchRepository.findAll({ teamId }),
    teamRepository.findAll(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Cricket Matches
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse match fixtures, results, and recorded player match performances.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/matches/create"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition inline-flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <span>+ Record New Match</span>
          </Link>
        )}
      </div>

      {/* Filter by Team */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Filter Fixtures
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/matches"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !teamId
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            All Teams
          </Link>
          {teams.slice(0, 6).map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/matches?teamId=${t.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                teamId === t.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {t.shortName}
            </Link>
          ))}
        </div>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-xl font-bold mb-3">
            M
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No matches found
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {teamId ? 'No matches recorded for this team.' : 'Get started by creating your first match fixture.'}
          </p>
          {isAdmin && (
            <div className="mt-4">
              <Link
                href="/dashboard/matches/create"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition inline-block"
              >
                Record Match
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Teams vs Match Date */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      Played on {new Date(match.playedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span>•</span>
                    <span>{match._count?.performances || 0} Player Performances Recorded</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {match.teamA.name}
                    </span>
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      VS
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {match.teamB.name}
                    </span>
                  </div>

                  {match.result && (
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Result: {match.result}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <Link
                    href={`/dashboard/matches/${match.id}`}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    View Scorecard
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        href={`/dashboard/matches/${match.id}/edit`}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteMatchButton
                        matchId={match.id}
                        matchTitle={`${match.teamA.shortName} vs ${match.teamB.shortName}`}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

