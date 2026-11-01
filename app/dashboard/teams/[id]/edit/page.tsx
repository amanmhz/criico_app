import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { teamRepository } from '@/lib/repositories/team.repository';
import { TeamForm } from '../../_components/TeamForm';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/teams');
  }

  const team = await teamRepository.findById(id);
  if (!team) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/teams/${team.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition inline-block mb-2"
        >
          &larr; Back to team details
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit Team: {team.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Modify franchise names, codes, or descriptions.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <TeamForm mode="edit" initialData={team} />
      </div>
    </div>
  );
}

