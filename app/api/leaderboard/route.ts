import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, AuthError } from '@/lib/permissions';
import { leaderboardService } from '@/lib/services/leaderboard.service';
import type { PlayerRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as PlayerRole) || undefined;
    const teamId = searchParams.get('teamId') || undefined;

    const leaderboard = await leaderboardService.getLeaderboard({ role, teamId });
    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API /api/leaderboard GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
