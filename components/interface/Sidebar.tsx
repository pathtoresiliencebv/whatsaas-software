'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Home,
  MessageSquare,
  Users,
  Settings,
  Zap,
  BarChart3,
  FolderKanban,
  Mic2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Logo from '@/components/interface/Logo';

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const items = [
    { href: '/dashboard', icon: Home, label: t('dashboard') },
    { href: '/dashboard/chat', icon: MessageSquare, label: t('chats') },
    { href: '/contacts', icon: Users, label: t('contacts') },
    { href: '/automation', icon: Zap, label: t('whatsapp_agents') },
    { href: '/campaigns', icon: FolderKanban, label: t('campaigns') },
    { href: '/voice', icon: Mic2, label: t('voice_agents') },
    { href: '/analytics', icon: BarChart3, label: t('analytics') },
    { href: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="w-64 border-r bg-card h-full">
      <div className="p-4">
        <Link href="/dashboard" className="mb-6">
          <Logo className="h-8" />
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
