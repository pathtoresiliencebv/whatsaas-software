'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
}

export function ChatFilters({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  instances,
}: ChatFiltersProps) {
  const hasFilters = filters.funnelStageId || filters.tagId || filters.agentId || filters.instanceId;

  return (
    <div className="border-b border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
          >
            Unread
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {hasFilters && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 overflow-x-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Filters:</span>
          {filters.instanceId && (
            <Badge variant="secondary" className="text-xs">
              {instances.find((i) => i.dbId === filters.instanceId)?.instanceName || 'Instance'}
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
              Stage {filters.funnelStageId}
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
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
