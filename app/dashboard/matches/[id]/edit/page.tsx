import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { matchRepository } from '@/lib/repositories/match.repository';
import { prisma } from '@/lib/prisma';
import { MatchForm } from '../../_components/MatchForm';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/matches');
  }

  const [match, teams] = await Promise.all([
    matchRepository.findById(id),
    prisma.team.findMany({
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!match) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/matches/${match.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition inline-block mb-2"
        >
          &larr; Back to match details
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit Match: {match.teamA.shortName} vs {match.teamB.shortName}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Update fixture dates, results, and adjust player performances. Career stats will re-sync automatically.
        </p>
      </div>

      <MatchForm
        availableTeams={teams}
        initialData={match}
        mode="edit"
      />
    </div>
  );
}

