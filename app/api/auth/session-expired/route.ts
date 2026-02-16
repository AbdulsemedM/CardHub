import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'travler-card-session';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  const host = request.headers.get('host') ?? 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${protocol}://${host}`;
  return NextResponse.redirect(new URL('/login', baseUrl));
}
