import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { matchRepository } from '@/lib/repositories/match.repository';
import { DeleteMatchButton } from '../_components/DeleteMatchButton';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const match = await matchRepository.findById(id);
  if (!match) {
    notFound();
  }

  // Separate performances by team
  const teamAPerformances = match.performances.filter((p) => p.teamId === match.teamAId);
  const teamBPerformances = match.performances.filter((p) => p.teamId === match.teamBId);

  const teamATotalRuns = teamAPerformances.reduce((acc, p) => acc + p.runs, 0);
  const teamATotalWickets = teamAPerformances.reduce((acc, p) => acc + p.wickets, 0);

  const teamBTotalRuns = teamBPerformances.reduce((acc, p) => acc + p.runs, 0);
  const teamBTotalWickets = teamBPerformances.reduce((acc, p) => acc + p.wickets, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/dashboard/matches"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          &larr; Back to all matches
        </Link>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/matches/${match.id}/edit`}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition"
            >
              Edit Scorecard
            </Link>
            <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <DeleteMatchButton
                matchId={match.id}
                matchTitle={`${match.teamA.shortName} vs ${match.teamB.shortName}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Match Banner Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {new Date(match.playedAt).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          <div className="flex items-center justify-center space-x-6 sm:space-x-12 py-4">
            {/* Team A */}
            <div className="text-center space-y-1">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {match.teamA.name}
              </div>
              <div className="text-xs font-mono font-bold text-zinc-400">
                {match.teamA.shortName}
              </div>
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {teamATotalRuns} runs • {teamATotalWickets} wickets
              </div>
            </div>

            {/* VS Pill */}
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center font-black text-xs">
              VS
            </div>

            {/* Team B */}
            <div className="text-center space-y-1">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {match.teamB.name}
              </div>
              <div className="text-xs font-mono font-bold text-zinc-400">
                {match.teamB.shortName}
              </div>
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {teamBTotalRuns} runs • {teamBTotalWickets} wickets
              </div>
            </div>
          </div>

          {match.result && (
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Outcome: {match.result}
            </div>
          )}
        </div>
      </div>

      {/* Team A Scorecard */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {match.teamA.name} Scorecard ({teamAPerformances.length} players)
          </h2>
          <span className="text-xs font-mono font-semibold text-zinc-500">
            Aggregated: {teamATotalRuns} Runs / {teamATotalWickets} Wickets
          </span>
        </div>

        {teamAPerformances.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No player performance records for {match.teamA.name}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Player</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Runs</th>
                  <th className="px-4 py-3 text-center">Wickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {teamAPerformances.map((perf) => (
                  <tr key={perf.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      <Link
                        href={`/dashboard/players/${perf.player.id}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {perf.player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {perf.player.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {perf.runs}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {perf.wickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team B Scorecard */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {match.teamB.name} Scorecard ({teamBPerformances.length} players)
          </h2>
          <span className="text-xs font-mono font-semibold text-zinc-500">
            Aggregated: {teamBTotalRuns} Runs / {teamBTotalWickets} Wickets
          </span>
        </div>

        {teamBPerformances.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No player performance records for {match.teamB.name}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Player</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Runs</th>
                  <th className="px-4 py-3 text-center">Wickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {teamBPerformances.map((perf) => (
                  <tr key={perf.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      <Link
                        href={`/dashboard/players/${perf.player.id}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {perf.player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {perf.player.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {perf.runs}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-zinc-900 dark:text-zinc-100">
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

