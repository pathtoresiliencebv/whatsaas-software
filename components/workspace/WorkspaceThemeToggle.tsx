'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function WorkspaceThemeToggle({
  collapsed,
  className = '',
}: {
  collapsed: boolean;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Light Mode' : 'Dark Mode';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'w-full justify-center' : 'gap-3'} ${className}`}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && label}
    </button>
  );
}
