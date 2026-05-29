'use client';

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bot, Check, ChevronDown, PanelRight, Phone, Search, Sparkles, X, ZapOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useCall } from '@/providers/call-provider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChatHeaderProps {
  name?: string;
  status?: string;
  instanceName?: string;
  chatDetails?: any;
  showSearch?: boolean;
  setShowSearch?: any;
  searchQuery?: string;
  setSearchQuery?: any;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isGroup?: boolean;
  [key: string]: any;
}

type FunnelStage = {
  id: number;
  name: string;
  emoji?: string | null;
};

export function ChatHeader({
  name,
  status,
  instanceName,
  chatDetails,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  isSidebarCollapsed,
}: ChatHeaderProps) {
  const t = useTranslations('Chat');
  const call = useCall();
  const { mutate } = useSWRConfig();
  const { data: stages } = useSWR<FunnelStage[]>('/api/funnel-stages', fetcher);

  const resolvedName = name || chatDetails?.name || 'Onbekend';
  const resolvedStatus = status || chatDetails?.status || '';
  const resolvedInstanceName = instanceName || chatDetails?.integration || null;
  const resolvedAvatar = chatDetails?.profilePicUrl || undefined;
  const initials = resolvedName.slice(0, 2).toUpperCase();
  const contact = chatDetails?.contact;
  const currentStage = contact?.funnelStage;
  const phoneNumber = chatDetails?.phoneNumber || chatDetails?.remoteJid?.split('@')[0] || '';

  const updateStage = async (stageId: number | null) => {
    if (!contact?.id) return;
    const res = await fetch(`/api/contacts/${contact.id}/funnel-stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId }),
    });
    if (!res.ok) {
      toast.error(t('funnel_stage_error'));
      return;
    }
    toast.success(t('funnel_stage_updated'));
    mutate('/api/chats');
    if (chatDetails?.remoteJid) mutate(`/api/contacts/by-chat?jid=${chatDetails.remoteJid}`);
  };

  const startVoiceCall = () => {
    call?.openConfirmation({
      name: resolvedName,
      number: phoneNumber,
      avatar: resolvedAvatar,
      chatId: chatDetails?.chatId,
      jid: chatDetails?.remoteJid,
    });
  };

  return (
    <div className="flex h-[60px] items-center justify-between gap-3 border-b bg-card px-4 py-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={resolvedAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{resolvedName}</h2>
          <div className="flex items-center gap-2">
            {resolvedStatus && <span className="text-xs text-muted-foreground">{resolvedStatus}</span>}
            {phoneNumber && <span className="text-xs text-muted-foreground">{phoneNumber}</span>}
            {resolvedInstanceName && (
              <Badge variant="secondary" className="text-xs">
                {resolvedInstanceName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {showSearch && (
          <div className="relative hidden w-52 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery || ''}
              onChange={(event) => setSearchQuery?.(event.target.value)}
              placeholder={t('search_placeholder')}
              className="h-9 rounded-full pl-9 pr-8"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery?.('');
                setShowSearch?.(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          type="button"
          className="hidden bg-emerald-600 text-white hover:bg-emerald-700 sm:inline-flex"
          onClick={startVoiceCall}
          disabled={!phoneNumber || !call}
        >
          <Phone className="mr-2 h-4 w-4" />
          {t('voice_call')}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hidden gap-2 sm:inline-flex" disabled={!contact?.id}>
              <span>{currentStage?.emoji || '📍'}</span>
              <span className="max-w-32 truncate">{currentStage?.name || t('funnel_no_stage')}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => updateStage(null)}>
              <span className="min-w-5" />
              {t('funnel_no_stage')}
              {!currentStage && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(stages || []).map((stage) => (
              <DropdownMenuItem key={stage.id} onClick={() => updateStage(stage.id)}>
                <span className="min-w-5">{stage.emoji || '📌'}</span>
                {stage.name}
                {currentStage?.id === stage.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-700">
          <Bot className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <ZapOff className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowSearch?.(!showSearch)}>
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <PanelRight className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
        </Button>
      </div>
    </div>
  );
}
