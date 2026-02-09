import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('travler-card-session');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isRoot = request.nextUrl.pathname === '/';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isInitializePage = request.nextUrl.pathname === '/admin/initialize';

  // Allow admin initialize page without auth
  if (isInitializePage) {
    return NextResponse.next();
  }

  // If user is logged in and tries to access login page, redirect based on role
  if (isLoginPage && sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      const userType = session.userType;
      
      // Route based on user type and role
      if (userType === 'admin') {
        return NextResponse.redirect(new URL('/admin/users', request.url));
      } else if (userType === 'bank_staff') {
        const role = session.user?.role;
        if (role === 'branch_user' || role?.includes('BRANCH')) {
          return NextResponse.redirect(new URL('/requests', request.url));
        } else if (role === 'operations' || role?.includes('OPERATIONS')) {
          return NextResponse.redirect(new URL('/operations', request.url));
        } else if (role === 'ops_head' || role?.includes('HEAD')) {
          return NextResponse.redirect(new URL('/ops-head/pending', request.url));
        }
      }
    } catch {
      // Invalid session, continue to login
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow API routes, login page, and root (which redirects)
  if (isApiRoute || isLoginPage || isRoot) {
    return NextResponse.next();
  }

  // Redirect to login if no session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate session and check JWT expiry
  try {
    const session = JSON.parse(sessionCookie.value);
    
    if (session.expiresAt && session.expiresAt < Date.now()) {
      // Session expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('travler-card-session');
      return response;
    }

    // Role-based access control for admin routes
    if (isAdminRoute) {
      const userType = session.userType;
      if (userType !== 'admin' && session.user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch {
    // Invalid session cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('travler-card-session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
