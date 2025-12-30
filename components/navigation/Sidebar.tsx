'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types/user';
import {
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  Users,
  Settings,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['branch_officer', 'operations', 'ops_head', 'admin'],
  },
  {
    title: 'Applications',
    href: '/requests',
    icon: FolderOpen,
    roles: ['branch_officer', 'operations', 'ops_head', 'admin'],
    badge: 12,
  },
  {
    title: 'My Approvals',
    href: '/ops-head/pending',
    icon: CheckCircle2,
    roles: ['ops_head', 'operations', 'admin'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['operations', 'ops_head', 'admin'],
  },
];

const settingsItems: NavItem[] = [
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Preferences',
    href: '/preferences',
    icon: Settings,
    roles: ['branch_officer', 'operations', 'ops_head', 'admin'],
  },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));
  const filteredSettingsItems = settingsItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
        <Image
          src="/images/logo.png"
          alt="TravelPortal Logo"
          width={48}
          height={48}
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-base font-bold text-slate-900">TravelPortal</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-slate-500')} />
                {item.title}
              </div>
              {item.badge && (
                <Badge className="bg-white text-slate-900 text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
        
        <div className="pt-6">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settings
          </div>
          {filteredSettingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-slate-500')} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-lg bg-primary/10 p-4 dark:bg-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-900">Support</span>
          </div>
          <p className="text-xs text-slate-600 mb-3 dark:text-slate-400">
            Need help with the portal?
          </p>
          <Button
            variant="outline"
            className="w-full bg-white text-primary border-slate-200 hover:bg-slate-50"
            size="sm"
          >
            Contact IT
          </Button>
        </div>
      </div>
    </aside>
  );
}
