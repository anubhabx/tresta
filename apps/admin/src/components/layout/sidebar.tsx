'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Bell,
  Bug,
  Info,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Health', href: '/dashboard/health', icon: Activity },
  { name: 'DLQ', href: '/dashboard/dlq', icon: AlertTriangle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Plans', href: '/dashboard/plans', icon: CreditCard },
  { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Shield },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { name: 'Errors', href: '/dashboard/errors', icon: Bug },
  { name: 'System Info', href: '/dashboard/system', icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Tresta Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-500 text-center">
          Tresta Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}
