'use client';

import React from 'react';

type LogoProps = {
  className?: string;
  variant?: 'auto' | 'light' | 'dark';
};

export default function Logo({ className = 'h-8', variant = 'auto' }: LogoProps) {
  const baseClassName = `w-auto ${className}`;

  if (variant === 'light') {
    return <img src="/images/white-logo.png" alt="Kyrn" className={baseClassName} />;
  }

  if (variant === 'dark') {
    return <img src="/images/black-logo.png" alt="Kyrn" className={baseClassName} />;
  }

  return (
    <>
      <img src="/images/black-logo.png" alt="Kyrn" className={`${baseClassName} block dark:hidden`} />
      <img src="/images/white-logo.png" alt="Kyrn" className={`${baseClassName} hidden dark:block`} />
    </>
  );
}
