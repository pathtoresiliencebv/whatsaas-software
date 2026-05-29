'use client';

import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Image, Mic, Paperclip, Play, Send, Smile, Square, Video, X, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  isInternalNote?: boolean;
  setIsInternalNote?: (value: boolean) => void;
  newMessage?: string;
  setNewMessage?: (value: string | ((prev: string) => string)) => void;
  recordingStatus?: string;
  recordingTime?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onCancelRecording?: () => void;
  onSendText?: (event: React.FormEvent) => void;
  onSendAudio?: () => void;
  audioUrl?: string | null;
  isAudioPlaying?: boolean;
  toggleAudioPlayback?: () => void;
  audioPlayerRef?: React.RefObject<HTMLAudioElement>;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  handleFileIconClick?: (acceptType: string) => void;
  onEmojiClick?: (emojiData: EmojiClickData) => void;
  quickRepliesOpen?: boolean;
  setQuickRepliesOpen?: (open: boolean) => void;
  showQuickReplySuggestions?: boolean;
  setShowQuickReplySuggestions?: (show: boolean) => void;
  filteredQuickReplies?: Array<{ id: number; shortcut: string; message: string }>;
  isWindowExpired?: boolean;
  onOpenTemplateDialog?: () => void;
  isGroup?: boolean;
  onSendAttachment?: (file: File) => void;
  [key: string]: any;
}

function formatRecordingTime(seconds = 0) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function ChatInput({
  onSend,
  disabled,
  isInternalNote,
  setIsInternalNote,
  newMessage,
  setNewMessage,
  recordingStatus = 'idle',
  recordingTime = 0,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSendText,
  onSendAudio,
  audioUrl,
  isAudioPlaying,
  toggleAudioPlayback,
  audioPlayerRef,
  fileInputRef,
  handleFileIconClick,
  onEmojiClick,
  setQuickRepliesOpen,
  showQuickReplySuggestions,
  setShowQuickReplySuggestions,
  filteredQuickReplies = [],
  isWindowExpired,
  onOpenTemplateDialog,
  isGroup,
  onSendAttachment,
}: ChatInputProps) {
  const t = useTranslations('Chat');
  const [localMessage, setLocalMessage] = useState('');
  const message = newMessage ?? localMessage;
  const setMessage = setNewMessage ?? setLocalMessage;
  const isDisabled = disabled || isGroup || recordingStatus === 'sending';

  const insertQuickReply = (reply: { message: string }) => {
    setMessage(reply.message);
    setShowQuickReplySuggestions?.(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || isDisabled || isWindowExpired) return;
    if (onSendText) {
      onSendText(event);
      return;
    }
    onSend?.(message.trim());
    setMessage('');
  };

  const handleEmoji = (emojiData: EmojiClickData) => {
    if (onEmojiClick) {
      onEmojiClick(emojiData);
      return;
    }
    setMessage((prev: string) => `${prev}${emojiData.emoji}`);
  };

  return (
    <div className="relative bg-background">
      {isWindowExpired && !isInternalNote && (
        <div className="border-b bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center justify-between gap-3">
            <span>{t('awaiting_customer_reply')}</span>
            <Button size="sm" variant="outline" onClick={onOpenTemplateDialog}>
              {t('select_template_btn')}
            </Button>
          </div>
        </div>
      )}

      {isGroup && (
        <div className="border-b bg-muted px-4 py-2 text-sm text-muted-foreground">
          {t('group_read_only')}
        </div>
      )}

      <div className="flex h-10 items-end gap-5 px-4 pt-2 text-sm">
        <button
          type="button"
          onClick={() => setIsInternalNote?.(false)}
          className={`border-b-2 pb-2 ${!isInternalNote ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('message_text')}
        </button>
        <button
          type="button"
          onClick={() => setIsInternalNote?.(true)}
          className={`border-b-2 pb-2 ${isInternalNote ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('internal_note_text')}
        </button>
      </div>

      {showQuickReplySuggestions && filteredQuickReplies.length > 0 && (
        <div className="absolute bottom-[74px] left-16 z-30 w-80 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {filteredQuickReplies.slice(0, 6).map((reply) => (
            <button
              key={reply.id}
              type="button"
              onClick={() => insertQuickReply(reply)}
              className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted"
            >
              <span className="font-mono text-sm font-semibold text-primary">/{reply.shortcut.replace(/^\//, '')}</span>
              <span className="ml-2 text-sm text-muted-foreground">{reply.message}</span>
            </button>
          ))}
        </div>
      )}

      {recordingStatus === 'recording' && (
        <div className="flex items-center gap-3 border-t px-4 py-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium">{t('recording_status_text')}</span>
          <span className="text-sm text-muted-foreground">{formatRecordingTime(recordingTime)}</span>
          <Button size="sm" variant="outline" onClick={onStopRecording} className="ml-auto">
            <Square className="mr-2 h-3.5 w-3.5" />
            Stop
          </Button>
          <Button size="icon" variant="ghost" onClick={onCancelRecording}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {recordingStatus === 'review' && audioUrl && (
        <div className="flex items-center gap-3 border-t px-4 py-3">
          <audio ref={audioPlayerRef} src={audioUrl} />
          <Button size="icon" variant="outline" onClick={toggleAudioPlayback}>
            {isAudioPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-sm text-muted-foreground">{t('preview_title')}</span>
          <Button size="icon" variant="ghost" onClick={onCancelRecording} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={onSendAudio}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {recordingStatus !== 'recording' && recordingStatus !== 'review' && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSendAttachment?.(file);
              event.currentTarget.value = '';
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            onClick={() => setQuickRepliesOpen?.(true)}
            title="Quick replies"
          >
            <Zap className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" disabled={isDisabled}>
                <Paperclip className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFileIconClick?.('image/*')}>
                <Image className="mr-2 h-4 w-4" />
                {t('image_item')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileIconClick?.('video/*')}>
                <Video className="mr-2 h-4 w-4" />
                {t('video_item')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileIconClick?.('*')}>
                <FileText className="mr-2 h-4 w-4" />
                {t('document_item2')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" disabled={isDisabled}>
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-auto border-none p-0">
              <EmojiPicker onEmojiClick={handleEmoji} lazyLoadEmojis />
            </PopoverContent>
          </Popover>

          <Input
            className="h-11 flex-1 rounded-full px-5"
            placeholder={isInternalNote ? t('add_internal_note_placeholder') : t('type_message_placeholder')}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isDisabled || (isWindowExpired && !isInternalNote)}
          />

          {message.trim() ? (
            <Button size="icon" type="submit" disabled={isDisabled || (isWindowExpired && !isInternalNote)}>
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="icon" disabled={isDisabled} onClick={onStartRecording}>
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
