import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'travler-card-session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    let token: string | null = null;

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        token = session?.token ?? null;
      } catch {
        // Invalid cookie, continue
      }
    }

    // Call backend to invalidate token
    if (token) {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cardhub.coopbankoromiasc.com';
      await fetch(`${backendUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: '',
      });
    }

    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true }); // Still clear local session on error
  }
}










