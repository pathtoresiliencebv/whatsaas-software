'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  isInternalNote?: boolean;
  setIsInternalNote?: any;
  newMessage?: string;
  setNewMessage?: any;
  [key: string]: any;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-card">
      <Button variant="ghost" size="icon" disabled={disabled}>
        <Paperclip className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled}>
        <Smile className="h-5 w-5" />
      </Button>
      <Input
        className="flex-1"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {message.trim() ? (
        <Button size="icon" onClick={handleSend} disabled={disabled}>
          <Send className="h-5 w-5" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
