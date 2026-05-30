'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellOff, Check, ChevronRight, Funnel, Tag, UserRound } from 'lucide-react';
import { toast } from 'sonner';

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
  emoji?: string | null;
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
  agents,
  funnelStages,
  tags,
  onContactUpdate,
  isMuted,
  onToggleMute,
}: ChatListItemProps) {
  const router = useRouter();
  const isGroupChat = chat.remoteJid.endsWith('@g.us');
  const displayName = chat.contact?.name || chat.name || chat.pushName || chat.remoteJid.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const previewText = chat.lastMessageText || chat.lastMessage || 'Nog geen berichten';
  const contactId = chat.contact?.id;
  const selectedTagIds = new Set(chat.contact?.tags?.map((tag) => tag.id) || []);
  const routeJid = encodeURIComponent(isGroupChat ? chat.remoteJid : chat.remoteJid.split('@')[0]);
  const chatParams = new URLSearchParams({ chatId: String(chat.id) });

  if (chat.instanceId) {
    chatParams.set('instanceId', String(chat.instanceId));
  }

  const chatHref = `/dashboard/chat/${routeJid}?${chatParams.toString()}`;

  const time = chat.lastMessageTimestamp
    ? new Date(chat.lastMessageTimestamp).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  const instanceName = instances.find((i) => i.dbId === chat.instanceId)?.instanceName;

  const openChat = () => {
    if (isSelectionMode) {
      onSelect(chat.id);
      return;
    }
    router.push(chatHref);
  };

  const refreshContacts = () => onContactUpdate?.(null);

  const assignAgent = async (agentId: number | null) => {
    if (!contactId) return;
    const res = await fetch(`/api/contacts/${contactId}/assign-agent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    if (!res.ok) {
      toast.error('Agent kon niet worden bijgewerkt.');
      return;
    }
    refreshContacts();
  };

  const updateStage = async (stageId: number | null) => {
    if (!contactId) return;
    const res = await fetch(`/api/contacts/${contactId}/funnel-stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId }),
    });
    if (!res.ok) {
      toast.error('Fase kon niet worden bijgewerkt.');
      return;
    }
    refreshContacts();
  };

  const toggleTag = async (tagId: number) => {
    if (!contactId) return;
    const hasTag = selectedTagIds.has(tagId);
    const res = await fetch(`/api/contacts/${contactId}/tags${hasTag ? `/${tagId}` : ''}`, {
      method: hasTag ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: hasTag ? undefined : JSON.stringify({ tagId }),
    });
    if (!res.ok) {
      toast.error('Tag kon niet worden bijgewerkt.');
      return;
    }
    refreshContacts();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openChat}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openChat();
      }}
      className={`group mx-2 mb-1 flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/70 ${
        isActive ? 'bg-muted/80' : ''
      } ${isSelected ? 'bg-primary/5' : ''}`}
    >
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(chat.id)}
          className="shrink-0"
          onClick={(event) => event.stopPropagation()}
        />
      )}

      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={chat.profilePicUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-[9px] text-white">
          ✓
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate font-semibold ${chat.unreadCount ? 'text-foreground' : 'text-foreground/90'}`}>
            {displayName}
          </span>
          {time && <span className="shrink-0 text-xs text-muted-foreground">{time}</span>}
        </div>

        <div className="mt-1 flex items-center gap-2">
          {chat.lastMessageFromMe !== undefined && (
            <span className={`text-xs ${chat.lastMessageFromMe ? 'text-primary' : 'text-muted-foreground'}`}>
              {chat.lastMessageFromMe ? '✓' : ''}
            </span>
          )}
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{previewText}</p>
          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {chat.contact?.funnelStage && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
              {chat.contact.funnelStage.emoji || '📌'} {chat.contact.funnelStage.name}
            </span>
          )}
          {chat.contact?.tags?.slice(0, 2).map((tag) => (
            <span key={tag.id} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {tag.name}
            </span>
          ))}
          {instanceName && <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{instanceName}</span>}
          {isMuted && <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" onClick={(event) => event.stopPropagation()}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!contactId}>
              <UserRound className="mr-2 h-4 w-4" />
              Agent toewijzen
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem onClick={() => assignAgent(null)}>
                Niemand
                {!chat.contact?.assignedUser && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {agents.map((agent) => (
                <DropdownMenuItem key={agent.id} onClick={() => assignAgent(agent.id)}>
                  {agent.name || agent.email}
                  {chat.contact?.assignedUser?.id === agent.id && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!contactId}>
              <Funnel className="mr-2 h-4 w-4" />
              Funnelfase
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem onClick={() => updateStage(null)}>
                Geen fase
                {!chat.contact?.funnelStage && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {funnelStages.map((stage) => (
                <DropdownMenuItem key={stage.id} onClick={() => updateStage(stage.id)}>
                  <span className="mr-2">{stage.emoji || '📌'}</span>
                  {stage.name}
                  {chat.contact?.funnelStage?.id === stage.id && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!contactId}>
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {tags.length === 0 && <DropdownMenuItem disabled>Geen tags</DropdownMenuItem>}
              {tags.map((tag) => (
                <DropdownMenuItem key={tag.id} onClick={() => toggleTag(tag.id)}>
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-slate-400" />
                  {tag.name}
                  {selectedTagIds.has(tag.id) && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleMute}>
            <BellOff className="mr-2 h-4 w-4" />
            {isMuted ? 'Meldingen aanzetten' : 'Meldingen dempen'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
