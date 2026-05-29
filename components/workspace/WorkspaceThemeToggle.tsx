'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function WorkspaceThemeToggle({
  collapsed,
  iconOnly = false,
  className = '',
}: {
  collapsed: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Lichte modus' : 'Donkere modus';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={
        iconOnly
          ? `flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${className}`
          : `flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'w-full justify-center' : 'gap-3'} ${className}`
      }
    >
      <Icon className="h-4 w-4" />
      {!collapsed && !iconOnly && label}
    </button>
  );
}
