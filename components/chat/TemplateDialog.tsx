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
import { Textarea } from '@/components/ui/textarea';

type Template = {
  id: number;
  name: string;
  message: string;
};

interface TemplateDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (template: Template) => void;
  onSendTemplate?: (templateId: number, variables: Record<string, string>) => Promise<void>;
  [key: string]: any;
}

export function TemplateDialog({ open, onOpenChange, onSelect }: TemplateDialogProps) {
  const [templates] = React.useState<Template[]>([
    { id: 1, name: 'Begroeting', message: 'Hallo! Waarmee kan ik je vandaag helpen?' },
    { id: 2, name: 'Bedankt', message: 'Bedankt voor je bericht. We komen hier snel bij je op terug.' },
    { id: 3, name: 'Follow-up', message: 'Ik volg nog even op naar aanleiding van ons vorige gesprek.' },
  ]);
  const [search, setSearch] = React.useState('');

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Berichtsjablonen</DialogTitle>
          <DialogDescription>Kies een sjabloon om in je bericht te gebruiken.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Sjablonen zoeken..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => {
                onSelect?.(template);
                onOpenChange?.(false);
              }}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{template.message}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Geen sjablonen gevonden.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Annuleren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
