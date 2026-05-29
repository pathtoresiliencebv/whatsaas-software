'use client';

import React from 'react';
import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type QuickReply = {
  id: number;
  shortcut: string;
  content?: string;
  message?: string;
};

interface QuickRepliesModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (message: string) => void;
  [key: string]: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function QuickRepliesModal({ open, onOpenChange, onSelect }: QuickRepliesModalProps) {
  const { data, mutate } = useSWR<QuickReply[]>('/api/quick-replies', fetcher);
  const [shortcut, setShortcut] = React.useState('');
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const replies = data || [];

  const addReply = async () => {
    if (!shortcut.trim() || !content.trim()) return;
    setSaving(true);
    const res = await fetch('/api/quick-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortcut, content }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error('Quick reply kon niet worden opgeslagen.');
      return;
    }
    setShortcut('');
    setContent('');
    mutate();
  };

  const removeReply = async (id: number) => {
    await fetch('/api/quick-replies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Snelle antwoorden</DialogTitle>
          <DialogDescription>Beheer je snelkoppelingen. Typ /snelkoppeling om ze te gebruiken.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
          <Input
            placeholder="Snelkoppeling"
            value={shortcut}
            onChange={(event) => setShortcut(event.target.value)}
          />
          <Input
            placeholder="Volledige berichttekst..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addReply();
            }}
          />
        </div>

        <Button
          type="button"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={saving || !shortcut.trim() || !content.trim()}
          onClick={addReply}
        >
          Nieuwe toevoegen
        </Button>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {replies.map((reply) => {
            const text = reply.message || reply.content || '';
            return (
              <button
                key={reply.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border bg-muted/30 px-3 py-3 text-left transition hover:bg-muted"
                onClick={() => {
                  onSelect?.(text);
                  onOpenChange?.(false);
                }}
              >
                <span className="font-mono text-sm font-semibold text-primary">/{reply.shortcut.replace(/^\//, '')}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{text}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeReply(reply.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </span>
              </button>
            );
          })}

          {replies.length === 0 && (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Nog geen snelle antwoorden.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
