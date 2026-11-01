import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin, AuthError } from '@/lib/permissions';
import { teamService, TeamServiceError } from '@/lib/services/team.service';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || undefined;

    const teams = await teamService.listTeams({ name });
    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof TeamServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/teams GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const team = await teamService.createTeam(body);

    return NextResponse.json(
      { message: 'Team created successfully', team },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof TeamServiceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    console.error('[API /api/teams POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

