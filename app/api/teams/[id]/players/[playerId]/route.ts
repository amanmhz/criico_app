import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/permissions';
import {
  teamPlayerService,
  TeamPlayerServiceError,
} from '@/lib/services/teamPlayer.service';

interface RouteContext {
  params: Promise<{ id: string; playerId: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin(request);
    const { id, playerId } = await context.params;

    await teamPlayerService.removePlayerFromTeam(id, playerId);

    return NextResponse.json(
      { message: 'Player removed from team successfully' },
      { status: 200 }
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
    console.error('[API /api/teams/[id]/players/[playerId] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

