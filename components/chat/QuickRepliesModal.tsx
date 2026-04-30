'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type QuickReply = {
  id: number;
  shortcut: string;
  message: string;
};

interface QuickRepliesModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (message: string) => void;
  [key: string]: any;
}

export function QuickRepliesModal({ open, onOpenChange, onSelect }: QuickRepliesModalProps) {
  const [quickReplies] = React.useState<QuickReply[]>([
    { id: 1, shortcut: '/hello', message: 'Hello! How can I help you today?' },
    { id: 2, shortcut: '/thanks', message: 'Thank you for your message!' },
    { id: 3, shortcut: '/bye', message: 'Goodbye! Have a great day!' },
  ]);
  const [search, setSearch] = React.useState('');

  const filtered = quickReplies.filter(
    (qr) =>
      qr.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      qr.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Replies</DialogTitle>
          <DialogDescription>Select a quick reply to insert into your message.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search quick replies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map((qr) => (
            <div
              key={qr.id}
              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => {
                onSelect?.(qr.message);
                onOpenChange?.(false);
              }}
            >
              <div className="font-mono text-sm text-primary">{qr.shortcut}</div>
              <div className="text-sm text-muted-foreground mt-1">{qr.message}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No quick replies found.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
