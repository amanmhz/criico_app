import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin, AuthError } from '@/lib/permissions';
import {
  teamPlayerService,
  TeamPlayerServiceError,
} from '@/lib/services/teamPlayer.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAuth(request);
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const isAvailable = searchParams.get('available') === 'true';

    if (isAvailable) {
      const players = await teamPlayerService.listAvailablePlayers(id);
      return NextResponse.json({ players }, { status: 200 });
    }

    const players = await teamPlayerService.listTeamPlayers(id);
    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof TeamPlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/teams/[id]/players GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    const body = await request.json().catch(() => ({}));
    const assignment = await teamPlayerService.addPlayerToTeam(id, body);

    return NextResponse.json(
      { message: 'Player added to team successfully', assignment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof TeamPlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/teams/[id]/players POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

