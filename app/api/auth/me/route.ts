import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connection } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    try {
      await connection();
    } catch {
      // Ignored outside Next.js request store (e.g. unit tests)
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
