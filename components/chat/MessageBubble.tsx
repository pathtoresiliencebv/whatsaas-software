'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { FileText, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Chat');
  const isFromMe = msg.fromMe ?? msg.key?.fromMe ?? false;
  const isInternal = Boolean(msg.isInternal);
  const messageObj = msg.message?.conversation || msg.message?.extendedTextMessage || '';
  const messageText = msg.text || (typeof messageObj === 'string' ? messageObj : '') || '';
  const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const status = msg.status as 'sent' | 'delivered' | 'read' | 'error' | undefined;
  const hasError = status === 'error' || Boolean(msg.errorMessage);

  const statusIcon = isFromMe ? (
    status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'
  ) : null;

  if (isInternal) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-950 shadow-sm dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-100">
          <div className="mb-2 flex items-center gap-1.5 border-b border-yellow-300 pb-1.5 text-xs font-medium text-yellow-700 dark:border-yellow-800 dark:text-yellow-300">
            <FileText className="h-3.5 w-3.5" />
            {t('internal_note_title')}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm">{messageText}</p>
          <div className="mt-1 text-right text-[10px] text-yellow-700/80 dark:text-yellow-300/80">
            {timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isFromMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
          hasError && 'border border-red-300 bg-red-50 text-red-700',
          isFromMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isGroup && !isFromMe && (
          <p className="text-xs font-semibold text-primary mb-1">{msg.pushName || 'Onbekend'}</p>
        )}
        <p className="whitespace-pre-wrap break-words">{messageText}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            hasError && 'text-red-600',
            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {hasError && (
            <>
              <span>{t('send_failed')}</span>
              <RotateCcw className="h-3 w-3" />
            </>
          )}
          <span>{timestamp}</span>
          {statusIcon && <span>{statusIcon}</span>}
        </div>
      </div>
    </div>
  );
}
