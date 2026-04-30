'use client';

import React from 'react';

interface DateSeparatorProps {
  date: string | Date;
  label?: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const displayDate = date instanceof Date ? date.toLocaleDateString() : date;
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-muted px-3 py-1 rounded-full">
        <span className="text-xs text-muted-foreground">{displayDate}</span>
      </div>
    </div>
  );
}
