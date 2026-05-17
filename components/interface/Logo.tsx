'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function Logo({ className = 'h-8' }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Image
      src={isDark ? '/images/white-logo.png' : '/images/black-logo.png'}
      alt="Kyrn"
      width={120}
      height={32}
      className={`h-8 w-auto ${className}`}
      priority
    />
  );
}
