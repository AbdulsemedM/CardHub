'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User, BankStaff } from '@/lib/types/user';
import {
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  Users,
  Settings,
  Headphones,
  Shield,
  AlertTriangle,
  CreditCard,
  Printer,
  FileText,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserRole } from '@/lib/services/auth-service';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number;
}

// Helper to normalize role for comparison
function normalizeRole(role: string): string {
  // Handle both legacy and new role formats
  const roleMap: Record<string, string> = {
    'branch_officer': 'BRANCH_USER',
    'operations': 'OPERATIONS',
    'ops_head': 'OPERATIONS_HEAD',
    'admin': 'ADMIN',
  };
  return roleMap[role.toLowerCase()] || role.toUpperCase();
}

function getNavItems(userRole: string): NavItem[] {
  const normalized = normalizeRole(userRole);
  
  // Admin menu
  if (normalized === 'ADMIN') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN'],
      },
      {
        title: 'Bank Staff',
        href: '/admin/users',
        icon: UserCog,
        roles: ['ADMIN'],
      },
      {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: FileText,
        roles: ['ADMIN'],
      },
    ];
  }
  
  // Branch User menu
  if (normalized === 'BRANCH_USER') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['BRANCH_USER'],
      },
      {
        title: 'Pending Reviews',
        href: '/requests',
        icon: FolderOpen,
        roles: ['BRANCH_USER'],
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['BRANCH_USER'],
      },
    ];
  }
  
  // Operations menu
  if (normalized === 'OPERATIONS') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['OPERATIONS'],
      },
      {
        title: 'Pending Reviews',
        href: '/operations',
        icon: Shield,
        roles: ['OPERATIONS'],
      },
      {
        title: 'All Operations',
        href: '/operations/all',
        icon: FolderOpen,
        roles: ['OPERATIONS'],
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['OPERATIONS'],
      },
    ];
  }
  
  // Operations Head menu
  if (normalized === 'OPERATIONS_HEAD') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['OPERATIONS_HEAD'],
      },
      {
        title: 'Escalated Items',
        href: '/ops-head/pending',
        icon: AlertTriangle,
        roles: ['OPERATIONS_HEAD'],
      },
      {
        title: 'All Reviews',
        href: '/operations',
        icon: Shield,
        roles: ['OPERATIONS_HEAD'],
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['OPERATIONS_HEAD'],
      },
    ];
  }
  
  // Card Issuance menu
  if (normalized === 'CARD_ISSUANCE') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['CARD_ISSUANCE'],
      },
      {
        title: 'Approved Requests',
        href: '/card-issuance',
        icon: CreditCard,
        roles: ['CARD_ISSUANCE'],
      },
      {
        title: 'Card Tracking',
        href: '/card-issuance/tracking',
        icon: FolderOpen,
        roles: ['CARD_ISSUANCE'],
      },
    ];
  }
  
  // Printing menu
  if (normalized === 'PRINTING') {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['PRINTING'],
      },
      {
        title: 'Cards to Print',
        href: '/printing',
        icon: Printer,
        roles: ['PRINTING'],
      },
      {
        title: 'Ready Cards',
        href: '/printing/ready',
        icon: CheckCircle2,
        roles: ['PRINTING'],
      },
    ];
  }
  
  // Default menu (fallback)
  return [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: [normalized],
    },
  ];
}

const settingsItems: NavItem[] = [
  {
    title: 'Preferences',
    href: '/preferences',
    icon: Settings,
    roles: ['BRANCH_USER', 'OPERATIONS', 'OPERATIONS_HEAD', 'CARD_ISSUANCE', 'PRINTING', 'ADMIN'],
  },
];

function getRoleFromUser(user: User | BankStaff): string {
  return typeof user.role === 'object' ? user.role.roleName : user.role;
}

export function Sidebar({ user }: { user: User | BankStaff }) {
  const pathname = usePathname();
  const userRole = getRoleFromUser(user);
  
  // Get actual role from localStorage or user object
  const currentRole = getUserRole() || userRole;
  const normalized = normalizeRole(currentRole);
  
  const navItemsForRole = getNavItems(currentRole);
  const filteredSettingsItems = settingsItems.filter((item) => 
    item.roles.includes(normalized) || item.roles.includes(userRole)
  );

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
        {navItemsForRole.map((item) => {
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
