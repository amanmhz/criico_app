import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { playerRepository } from '@/lib/repositories/player.repository';
import { PlayerForm } from '../../_components/PlayerForm';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlayerPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/players');
  }

  const player = await playerRepository.findById(id);
  if (!player) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/players/${player.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition inline-block mb-2"
        >
          &larr; Back to player details
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit Player: {player.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Update player profile information and career statistics.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <PlayerForm mode="edit" initialData={player} />
      </div>
    </div>
  );
}

