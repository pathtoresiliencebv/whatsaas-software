'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Check, Filter } from 'lucide-react';

type InstanceData = {
  dbId: number;
  instanceName: string;
  integration: string;
};

type FilterState = {
  funnelStageId: number | null;
  tagId: number | null;
  agentId: number | null;
  instanceId: number | null;
};

interface ChatFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  instances: InstanceData[];
  agents?: Array<{ id: number; name?: string | null; email?: string }>;
  funnelStages?: Array<{ id: number; name: string; emoji?: string | null }>;
  tags?: Array<{ id: number; name: string }>;
}

export function ChatFilters({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  instances,
  agents = [],
  funnelStages = [],
  tags = [],
}: ChatFiltersProps) {
  const hasFilters = filters.funnelStageId || filters.tagId || filters.agentId || filters.instanceId;

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-2 px-4 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 flex-1">
          <TabsList className="h-9 justify-start rounded-full bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border-0 px-4 py-2 text-sm data-[state=active]:bg-muted"
          >
            Alles
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-full border-0 px-4 py-2 text-sm data-[state=active]:bg-muted"
          >
            Ongelezen
          </TabsTrigger>
        </TabsList>
      </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Funnelfase</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, funnelStageId: null })}>
                  Elke fase
                  {!filters.funnelStageId && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {funnelStages.map((stage) => (
                  <DropdownMenuItem key={stage.id} onClick={() => setFilters({ ...filters, funnelStageId: stage.id })}>
                    <span className="mr-2">{stage.emoji || '📌'}</span>
                    {stage.name}
                    {filters.funnelStageId === stage.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Agent</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, agentId: null })}>
                  Iedereen
                  {!filters.agentId && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {agents.map((agent) => (
                  <DropdownMenuItem key={agent.id} onClick={() => setFilters({ ...filters, agentId: agent.id })}>
                    {agent.name || agent.email}
                    {filters.agentId === agent.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tags</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, tagId: null })}>
                  Elke tag
                  {!filters.tagId && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {tags.map((tag) => (
                  <DropdownMenuItem key={tag.id} onClick={() => setFilters({ ...filters, tagId: tag.id })}>
                    {tag.name}
                    {filters.tagId === tag.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Instantie</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, instanceId: null })}>
                  Elke instantie
                  {!filters.instanceId && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {instances.map((instance) => (
                  <DropdownMenuItem key={instance.dbId} onClick={() => setFilters({ ...filters, instanceId: instance.dbId })}>
                    {instance.instanceName}
                    {filters.instanceId === instance.dbId && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {hasFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setFilters({
                      funnelStageId: null,
                      tagId: null,
                      agentId: null,
                      instanceId: null,
                    })
                  }
                >
                  Alles wissen
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 overflow-x-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Filters:</span>
          {filters.instanceId && (
            <Badge variant="secondary" className="text-xs">
              {instances.find((i) => i.dbId === filters.instanceId)?.instanceName || 'Instantie'}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setFilters({ ...filters, instanceId: null })}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.funnelStageId && (
            <Badge variant="secondary" className="text-xs">
              Fase {filters.funnelStageId}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setFilters({ ...filters, funnelStageId: null })}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.tagId && (
            <Badge variant="secondary" className="text-xs">
              Tag {filters.tagId}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setFilters({ ...filters, tagId: null })}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.agentId && (
            <Badge variant="secondary" className="text-xs">
              Agent {filters.agentId}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setFilters({ ...filters, agentId: null })}
              >
                ×
              </button>
            </Badge>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-destructive whitespace-nowrap"
            onClick={() =>
              setFilters({
                funnelStageId: null,
                tagId: null,
                agentId: null,
                instanceId: null,
              })
            }
          >
            Alles wissen
          </button>
        </div>
      )}
    </div>
  );
}
