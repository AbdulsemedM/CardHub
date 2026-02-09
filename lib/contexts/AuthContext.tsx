'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/user';
import { getUserType, getUserRole } from '../services/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userType: 'admin' | 'bank_staff' | null;
  refresh: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'bank_staff' | null>(null);

  const refresh = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserType(getUserType());
      } else {
        setUser(null);
        setUserType(null);
      }
    } catch {
      setUser(null);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userType === 'admin' || user?.role === 'admin';
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    const currentRole = getUserRole() || user.role;
    return currentRole?.toLowerCase() === role.toLowerCase();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userType, refresh, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

