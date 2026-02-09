import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'travler-card-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, token } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Identifier and password are required' },
        { status: 400 }
      );
    }

    // If token is provided, it means frontend already authenticated with backend
    // Just create the session cookie
    if (token) {
      // We'll need the full staff info from the token or passed separately
      // For now, create a basic session
      const session = {
        user: {
          id: identifier,
          username: identifier,
          email: identifier,
          name: identifier,
          role: 'branch_user', // This will be overridden by the actual role
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        token,
        expiresAt: Date.now() + SESSION_DURATION,
        userType: 'bank_staff',
      };

      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
      });

      return NextResponse.json({
        success: true,
        user: session.user,
        userType: 'bank_staff',
      });
    }

    // If no token, this is fallback/legacy behavior
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
