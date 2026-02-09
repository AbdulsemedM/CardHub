import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'travler-card-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, username, email, fullName, role } = body;

    if (!token || !username) {
      return NextResponse.json(
        { success: false, error: 'Token and username are required' },
        { status: 400 }
      );
    }

    const session = {
      user: {
        staffId: 0,
        username,
        email: email || username,
        fullName: fullName || username,
        role: { roleId: 0, roleName: role || 'BRANCH_USER' },
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
