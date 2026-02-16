'use server';

import { cookies } from 'next/headers';
import type { User, BankStaff, AuthSession, UserRole } from './types/user';
import usersData from './mock-data/users.json';

const SESSION_COOKIE = 'travler-card-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  // Mock authentication - in real app, verify password
  const userData = usersData.find((u) => u.username === username && u.isActive);
  
  if (!userData) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Mock password check (accept any password for demo)
  if (password.length < 3) {
    return { success: false, error: 'Invalid username or password' };
  }

  const user: User = {
    ...userData,
    role: userData.role as UserRole,
  };

  const session: AuthSession = {
    user,
    token: `mock-token-${user.id}-${Date.now()}`,
    expiresAt: Date.now() + SESSION_DURATION,
    userType: user.role === 'admin' ? 'admin' : 'bank_staff',
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  });

  return { success: true, user };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: AuthSession = JSON.parse(sessionCookie.value);
    
    // Check if session expired
    if (session.expiresAt < Date.now()) {
      await logout();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | BankStaff | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<User | BankStaff> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  return user!;
}

// Map StaffRole to UserRole for role checks
const STAFF_ROLE_TO_USER_ROLE: Record<string, UserRole> = {
  BRANCH_USER: 'branch_officer',
  BRANCH: 'branch_officer',
  OPERATIONS: 'operations',
  OPERATIONS_HEAD: 'ops_head',
  ADMIN: 'admin',
};

export async function requireRole(allowedRoles: UserRole[]): Promise<User | BankStaff> {
  const user = await requireAuth();
  const role: UserRole = 'role' in user && typeof user.role === 'object'
    ? (STAFF_ROLE_TO_USER_ROLE[user.role.roleName] ?? user.role.roleName as UserRole)
    : user.role;
  if (!allowedRoles.includes(role)) {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard');
  }
  return user;
}

