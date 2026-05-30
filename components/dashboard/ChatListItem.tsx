'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Funnel, MessageCircle } from 'lucide-react';

export type Agent = {
  id: number;
  name: string | null;
  email?: string;
  [key: string]: any;
};

export type FunnelStage = {
  id: number;
  name: string;
  color?: string;
};

export type TagData = {
  id: number;
  name: string;
  color?: string;
};

export type Contact = {
  id?: number;
  name?: string;
  pushName?: string;
  funnelStage?: FunnelStage;
  tags?: TagData[];
  assignedUser?: Agent;
};

export type Chat = {
  id: number;
  teamId: number;
  remoteJid: string;
  name?: string;
  pushName?: string;
  profilePicUrl?: string | null;
  lastMessage?: string;
  lastMessageText?: string | null;
  lastMessageTimestamp?: Date | string | number;
  lastMessageFromMe?: boolean;
  unreadCount?: number;
  instanceId?: number | null;
  contact?: Contact;
};

type InstanceData = {
  dbId: number;
  instanceName: string;
  integration: string;
};

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  instances: InstanceData[];
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (chatId: number) => void;
  agents: Agent[];
  funnelStages: FunnelStage[];
  tags: TagData[];
  onContactUpdate?: (updater: ((chats: Chat[]) => Chat[]) | null) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function ChatListItem({
  chat,
  isActive,
  instances,
  isSelectionMode,
  isSelected,
  onSelect,
}: ChatListItemProps) {
  const isGroupChat = chat.remoteJid.endsWith('@g.us');
  const displayName = chat.contact?.name || chat.name || chat.pushName || chat.remoteJid.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const previewText = chat.lastMessageText || chat.lastMessage || 'No messages yet';
  const routeJid = encodeURIComponent(isGroupChat ? chat.remoteJid : chat.remoteJid.split('@')[0]);
  const chatParams = new URLSearchParams({ chatId: String(chat.id) });

  if (chat.instanceId) {
    chatParams.set('instanceId', String(chat.instanceId));
  }

  const chatHref = `/dashboard/chat/${routeJid}?${chatParams.toString()}`;

  const time = chat.lastMessageTimestamp
    ? new Date(chat.lastMessageTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  const instanceName = instances.find((i) => i.dbId === chat.instanceId)?.instanceName;

  return (
    <Link
      href={chatHref}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${
        isActive ? 'bg-muted/70' : ''
      } ${isSelected ? 'bg-primary/5' : ''}`}
      onClick={(e) => {
        if (isSelectionMode) {
          e.preventDefault();
          onSelect(chat.id);
        }
      }}
    >
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(chat.id)}
          className="shrink-0"
        />
      )}

      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={chat.profilePicUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${chat.unreadCount ? 'text-foreground' : 'text-foreground/90'}`}>
              {displayName}
            </span>
            {isGroupChat && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Group
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {time && <span className="text-xs text-muted-foreground">{time}</span>}
            {instanceName && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {instanceName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {chat.lastMessageFromMe !== undefined && (
            <span className={`text-xs ${chat.lastMessageFromMe ? 'text-primary' : 'text-muted-foreground'}`}>
              {chat.lastMessageFromMe ? '✓ ' : ''}
            </span>
          )}
          <p className="text-sm text-muted-foreground truncate flex-1">
            {previewText}
          </p>
          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 text-xs justify-center">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          )}
        </div>

        {chat.contact?.funnelStage && (
          <div className="flex items-center gap-2 mt-1">
            <Funnel className="h-3 w-3 text-muted-foreground" />
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${chat.contact.funnelStage.color || '#666'}20` }}
            >
              {chat.contact.funnelStage.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
