'use client';

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, FileText, Image, MapPin, Mic, MoreVertical, Phone, Plus, UserRound, Video } from 'lucide-react';

interface ChatSidebarProps {
  chatDetails?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isGroup?: boolean;
  onSyncMessages?: () => void;
  isSyncingMessages?: boolean;
  [key: string]: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatSidebar(props: ChatSidebarProps) {
  const { mutate } = useSWRConfig();
  const name = props.chatDetails?.name || 'Onbekend';
  const avatar = props.chatDetails?.profilePicUrl || undefined;
  const initials = name.slice(0, 2).toUpperCase();
  const contact = props.chatDetails?.contact;
  const { data: stages } = useSWR<Array<{ id: number; name: string; emoji?: string | null }>>('/api/funnel-stages', fetcher);
  const { data: tags } = useSWR<Array<{ id: number; name: string; color?: string }>>('/api/tags', fetcher);
  const { data: team } = useSWR<any>('/api/team', fetcher);
  const agents = team?.teamMembers?.map((member: any) => member.user) || [];
  const selectedTagIds = new Set(contact?.tags?.map((tag: any) => tag.id) || []);

  if (props.isCollapsed) return null;

  const refreshContact = () => {
    mutate('/api/chats');
    if (props.chatDetails?.remoteJid) mutate(`/api/contacts/by-chat?jid=${props.chatDetails.remoteJid}`);
  };

  const updateStage = async (stageId: number | null) => {
    if (!contact?.id) return;
    await fetch(`/api/contacts/${contact.id}/funnel-stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId }),
    });
    refreshContact();
  };

  const assignAgent = async (agentId: number | null) => {
    if (!contact?.id) return;
    await fetch(`/api/contacts/${contact.id}/assign-agent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    refreshContact();
  };

  const toggleTag = async (tagId: number) => {
    if (!contact?.id) return;
    const hasTag = selectedTagIds.has(tagId);
    await fetch(`/api/contacts/${contact.id}/tags${hasTag ? `/${tagId}` : ''}`, {
      method: hasTag ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: hasTag ? undefined : JSON.stringify({ tagId }),
    });
    refreshContact();
  };

  return (
    <aside className="hidden h-full basis-[23.077%] min-w-[160px] max-w-[220px] flex-col border-l bg-background lg:flex">
      <div className="flex items-center justify-between border-b p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{props.chatDetails?.phoneNumber || props.chatDetails?.remoteJid}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <section className="space-y-4">
          <InfoRow label="Funnelfase">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex max-w-[160px] items-center gap-1 truncate text-sm">
                  <span>{contact?.funnelStage?.emoji || '📍'}</span>
                  <span className="truncate">{contact?.funnelStage?.name || 'Geen fase'}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStage(null)}>
                  Geen fase
                  {!contact?.funnelStage && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(stages || []).map((stage) => (
                  <DropdownMenuItem key={stage.id} onClick={() => updateStage(stage.id)}>
                    <span className="mr-2">{stage.emoji || '📌'}</span>
                    {stage.name}
                    {contact?.funnelStage?.id === stage.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InfoRow>

          <InfoRow label="Agent toewijzen">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex max-w-[160px] items-center gap-1 truncate text-sm">
                  <span className="truncate">{contact?.assignedUser?.name || contact?.assignedUser?.email || 'Niemand'}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => assignAgent(null)}>
                  Niemand
                  {!contact?.assignedUser && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {agents.map((agent: any) => (
                  <DropdownMenuItem key={agent.id} onClick={() => assignAgent(agent.id)}>
                    <UserRound className="mr-2 h-4 w-4" />
                    {agent.name || agent.email}
                    {contact?.assignedUser?.id === agent.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InfoRow>

          <InfoRow label="Afdeling">
            <span className="text-sm">{contact?.assignedDepartment?.name || '-'}</span>
          </InfoRow>
        </section>

        <section className="border-t pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(tags || []).map((tag) => (
                  <DropdownMenuItem key={tag.id} onClick={() => toggleTag(tag.id)}>
                    {tag.name}
                    {selectedTagIds.has(tag.id) && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2">
            {contact?.tags?.length ? (
              contact.tags.map((tag: any) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)
            ) : (
              <p className="text-sm text-muted-foreground">Geen tags</p>
            )}
          </div>
        </section>

        <section className="border-t pt-5">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Notities</h3>
          <div className="min-h-24 rounded-xl bg-muted/50 p-4 text-sm">
            {contact?.notes || 'Nog geen notities'}
          </div>
        </section>

        <section className="border-t pt-5">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Activiteit</h3>
          <Button variant="outline" className="w-full" onClick={props.onSyncMessages} disabled={props.isSyncingMessages}>
            Berichten synchroniseren
          </Button>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Media</h3>
          <div className="grid grid-cols-6 rounded-xl bg-muted p-1">
            {[Image, Video, Mic, FileText, MapPin, Phone].map((Icon, index) => (
              <Button key={index} variant={index === 0 ? 'secondary' : 'ghost'} size="icon" className="h-8">
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <div className="mt-3 rounded-xl border py-8 text-center text-sm text-muted-foreground">
            Geen items gevonden.
          </div>
        </section>
      </div>
    </aside>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
