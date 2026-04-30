'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Session = {
  id: string;
  createdAt: string;
  messages: any[];
};

export function SessionsSheet({
  open,
  onOpenChange,
  sessions,
  type,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sessions?: Session[];
  type?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Sessions</SheetTitle>
          <SheetDescription>View your recent AI conversation sessions.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {(sessions || []).map((session) => (
            <div key={session.id} className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session {session.id.slice(0, 8)}</span>
                <Badge variant="secondary">{new Date(session.createdAt).toLocaleDateString()}</Badge>
              </div>
            </div>
          ))}
          {(!sessions || sessions.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No sessions yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
