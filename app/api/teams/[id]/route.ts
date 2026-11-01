import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin, AuthError } from '@/lib/permissions';
import { teamService, TeamServiceError } from '@/lib/services/team.service';

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

    const team = await teamService.getTeam(id);
    return NextResponse.json({ team }, { status: 200 });
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
    console.error('[API /api/teams/[id] GET]', error);
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

    const team = await teamService.updateTeam(id, body);
    return NextResponse.json(
      { message: 'Team updated successfully', team },
      { status: 200 }
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
    console.error('[API /api/teams/[id] PUT]', error);
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

    await teamService.deleteTeam(id);
    return NextResponse.json(
      { message: 'Team deleted successfully' },
      { status: 200 }
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
    console.error('[API /api/teams/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

