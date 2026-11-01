import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/auth';
import { authService, AuthenticationError } from '@/lib/services/auth.service';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate incoming request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Delegate authentication business logic to the service layer
    const { user, token } = await authService.login(validationResult.data);

    // 3. Construct HTTP response and set secure session cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user,
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Unexpected error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
