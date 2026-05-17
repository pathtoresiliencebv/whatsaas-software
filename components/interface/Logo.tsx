'use client';

import React from 'react';
import { useTheme } from 'next-themes';

export default function Logo({ className = 'h-8' }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <img
      src={isDark ? '/images/white-logo.png' : '/images/black-logo.png'}
      alt="Kyrn"
      className={`h-8 w-auto ${className}`}
    />
  );
}
