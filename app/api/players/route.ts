import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin, AuthError } from '@/lib/permissions';
import { playerService, PlayerServiceError } from '@/lib/services/player.service';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || undefined;
    const role = searchParams.get('role') || undefined;

    const players = await playerService.listPlayers({ name, role });
    return NextResponse.json({ players }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof PlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/players GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const player = await playerService.createPlayer(body);

    return NextResponse.json(
      { message: 'Player created successfully', player },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof PlayerServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/players POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

