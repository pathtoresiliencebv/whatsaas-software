'use client';

import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type InstanceData = {
  dbId: number;
  instanceName: string;
  integration: string;
};

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  instances: InstanceData[];
}

export function NewChatDialog({ isOpen, onClose, instances }: NewChatDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<number | null>(
    instances.length === 1 ? instances[0].dbId : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Vul een telefoonnummer in');
      return;
    }

    if (!selectedInstance) {
      toast.error('Kies een instantie');
      return;
    }

    setIsLoading(true);
    try {
      // Clean the phone number
      let cleanNumber = phoneNumber.replace(/\D/g, '');
      if (!cleanNumber.startsWith('1') && cleanNumber.length > 10) {
        cleanNumber = cleanNumber.slice(-10);
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteJid: `${cleanNumber}@s.whatsapp.net`,
          instanceId: selectedInstance,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat kon niet worden aangemaakt');
      }

      toast.success('Chat gestart');
      setPhoneNumber('');
      onClose();
    } catch (error) {
      toast.error('Chat starten mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nieuwe chat starten</DialogTitle>
          <DialogDescription>
            Vul een telefoonnummer in om een nieuw gesprek te starten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              placeholder="31612345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
            />
          </div>

          {instances.length > 1 && (
            <div className="space-y-2">
              <Label>Instantie</Label>
              <div className="space-y-1">
                {instances.map((instance) => (
                  <button
                    key={instance.dbId}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedInstance === instance.dbId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedInstance(instance.dbId)}
                  >
                    <div className="font-medium text-sm">{instance.instanceName}</div>
                    <div className="text-xs text-muted-foreground">{instance.integration}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuleren
          </Button>
          <Button onClick={handleStartChat} disabled={isLoading}>
            {isLoading ? 'Starten...' : 'Chat starten'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
