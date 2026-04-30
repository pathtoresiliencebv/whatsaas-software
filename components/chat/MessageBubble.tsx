'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from './types';

interface MessageBubbleProps {
  msg: Message;
  onMediaClick?: (messageId: string) => void;
  onReply?: any;
  onRetry?: any;
  onReaction?: any;
  onForward?: any;
  onInfo?: any;
  isGroup?: boolean;
  [key: string]: any;
}

export function MessageBubble({ msg, isGroup }: MessageBubbleProps) {
  const isFromMe = msg.fromMe ?? msg.key?.fromMe ?? false;
  const messageText = msg.text || (msg.message?.conversation ? Object.values(msg.message)[0] : '') || '';
  const timestamp = typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const status = msg.status as 'sent' | 'delivered' | 'read' | undefined;

  const statusIcon = isFromMe ? (
    status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'
  ) : null;

  return (
    <div className={cn('flex', isFromMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isFromMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isGroup && !isFromMe && (
          <p className="text-xs font-semibold text-primary mb-1">{msg.pushName || 'Unknown'}</p>
        )}
        <p className="whitespace-pre-wrap break-words">{messageText}</p>
        <div
          className={cn(
            'text-[10px] mt-1',
            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {timestamp} {statusIcon && <span className="ml-1">{statusIcon}</span>}
        </div>
      </div>
    </div>
  );
}
