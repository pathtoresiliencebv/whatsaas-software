'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TrafficHeatmap({ data }: { data?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      </CardContent>
    </Card>
  );
}

export function FunnelLineChart({ data }: { data?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      </CardContent>
    </Card>
  );
}

export function FunnelRadarChart({ data }: { data?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentList({ data }: { data?: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(data || []).map((agent, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm">{agent?.name || `Agent ${i + 1}`}</span>
              <span className="text-sm text-muted-foreground">{agent?.count || 0} chats</span>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No agents yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
