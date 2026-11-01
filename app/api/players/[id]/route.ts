import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin, AuthError } from '@/lib/permissions';
import { playerService, PlayerServiceError } from '@/lib/services/player.service';

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

    const player = await playerService.getPlayer(id);
    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof PlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/players/[id] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    const player = await playerService.updatePlayer(id, body);
    return NextResponse.json(
      { message: 'Player updated successfully', player },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof PlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/players/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await playerService.deletePlayer(id);
    return NextResponse.json(
      { message: 'Player deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof PlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/players/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

