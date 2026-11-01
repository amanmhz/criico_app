import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PlayerForm } from '../_components/PlayerForm';

export const instant = false;

export default async function CreatePlayerPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/players');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Create New Player
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Add a new cricket player to the system with their role, base price, and career stats.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <PlayerForm mode="create" />
      </div>
    </div>
  );
}

