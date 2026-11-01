import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { TeamForm } from '../_components/TeamForm';

export const instant = false;

export default async function CreateTeamPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard/teams');
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Create New Team
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Register a new cricket team franchise with unique names and identifiers.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <TeamForm mode="create" />
      </div>
    </div>
  );
}

