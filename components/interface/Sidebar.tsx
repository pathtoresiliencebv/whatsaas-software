'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Users,
  Settings,
  Zap,
  BarChart3,
  CreditCard,
  Plug,
  FolderKanban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const items = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/chats', icon: MessageSquare, label: 'Chats' },
  { href: '/contacts', icon: Users, label: 'Contacts' },
  { href: '/automation', icon: Zap, label: 'Automation' },
  { href: '/campaigns', icon: FolderKanban, label: 'Campaigns' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-full">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">K</span>
          </div>
          <span className="font-bold text-lg">Kyrn</span>
        </Link>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start gap-2', isActive && 'bg-primary/10')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
