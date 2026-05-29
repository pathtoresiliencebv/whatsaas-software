'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Plug, Key, Globe, Bell } from 'lucide-react';

const settingsNav = [
  { href: '/settings', icon: User, label: 'Profiel' },
  { href: '/settings/billing', icon: CreditCard, label: 'Facturering' },
  { href: '/settings/instances', icon: Plug, label: 'Instanties' },
  { href: '/settings/api', icon: Key, label: 'API-sleutels' },
  { href: '/settings/webhooks', icon: Globe, label: 'Webhooks' },
  { href: '/settings/notifications', icon: Bell, label: 'Meldingen' },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <aside className="w-64 shrink-0">
        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start gap-2', isActive && 'bg-muted')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
