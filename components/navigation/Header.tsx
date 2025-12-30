'use client';

import { useState, useRef, useEffect } from 'react';
import type { User } from '@/lib/types/user';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bell, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header({ user }: { user: User }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const roleLabels: Record<string, string> = {
    branch_officer: 'Branch Officer',
    operations: 'Operations',
    ops_head: 'Approver',
    admin: 'Admin',
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        avatarRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="text-lg font-bold">Dashboard Overview</h2>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-10 rounded-lg border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
        <Badge className="bg-primary text-primary-foreground px-3 py-1">
          {roleLabels[user.role] || user.role}
        </Badge>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-900">{user.name}</span>
          {user.branch && (
            <span className="text-xs text-slate-600">{user.branch}</span>
          )}
        </div>
        <div className="relative">
          <div
            ref={avatarRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    {user.branch && (
                      <p className="text-xs text-slate-500 mt-0.5">{user.branch}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </div>
              </div>
              
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile/settings navigation here if needed
                  }}
                >
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <span>Profile</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/preferences');
                  }}
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="border-t border-slate-200 py-2">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
