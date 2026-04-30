import React from 'react';

export default function Logo({ className = 'h-8', showName = true }: { className?: string; showName?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">W</span>
      </div>
      {showName && <span className="font-bold text-xl">WhatSaaS</span>}
    </div>
  );
}
