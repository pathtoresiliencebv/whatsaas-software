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
      toast.error('Please enter a phone number');
      return;
    }

    if (!selectedInstance) {
      toast.error('Please select an instance');
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
        throw new Error('Failed to create chat');
      }

      toast.success('Chat started successfully');
      setPhoneNumber('');
      onClose();
    } catch (error) {
      toast.error('Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>
            Enter a phone number to start a new conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
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
              <Label>Instance</Label>
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
            Cancel
          </Button>
          <Button onClick={handleStartChat} disabled={isLoading}>
            {isLoading ? 'Starting...' : 'Start Chat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
