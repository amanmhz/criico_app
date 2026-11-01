import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MatchForm } from '../_components/MatchForm';

export const instant = false;

export default async function CreateMatchPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/matches');
  }

  // Fetch all teams with their rosters so admin can select squads
  const teams = await prisma.team.findMany({
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
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Record New Cricket Match
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Select participating teams, specify match outcomes, and record individual player stats.
        </p>
      </div>

      <MatchForm availableTeams={teams} mode="create" />
    </div>
  );
}

