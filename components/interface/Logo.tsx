'use client';

import React from 'react';

type LogoProps = {
  className?: string;
  variant?: 'auto' | 'light' | 'dark';
};

function LogoImage({ src, className }: { src: string; className: string }) {
  return (
    <img
      src={src}
      alt="Kyrn"
      className={className}
      onError={(event) => {
        const image = event.currentTarget;
        if (!image.src.endsWith('/logo.svg')) {
          image.src = '/logo.svg';
        }
      }}
    />
  );
}

export default function Logo({ className = 'h-8', variant = 'auto' }: LogoProps) {
  const baseClassName = `w-auto ${className}`;

  if (variant === 'light') {
    return <LogoImage src="/images/white-logo.png" className={baseClassName} />;
  }

  if (variant === 'dark') {
    return <LogoImage src="/images/black-logo.png" className={baseClassName} />;
  }

  return (
    <>
      <LogoImage src="/images/black-logo.png" className={`${baseClassName} block dark:hidden`} />
      <LogoImage src="/images/white-logo.png" className={`${baseClassName} hidden dark:block`} />
    </>
  );
}
