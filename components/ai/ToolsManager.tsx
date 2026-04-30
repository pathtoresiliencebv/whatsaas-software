'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Tool = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

const defaultTools: Tool[] = [
  { id: 'search', name: 'Web Search', description: 'Search the internet for information', enabled: true },
  { id: 'calculator', name: 'Calculator', description: 'Perform mathematical calculations', enabled: true },
  { id: 'calendar', name: 'Calendar', description: 'Check and manage calendar events', enabled: false },
  { id: 'crm', name: 'CRM Tools', description: 'Access and update CRM data', enabled: false },
];

export function ToolsManager() {
  const [tools, setTools] = React.useState(defaultTools);

  const toggleTool = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Tools</CardTitle>
        <CardDescription>Configure which tools the AI can use.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center justify-between">
            <div>
              <Label className="font-medium">{tool.name}</Label>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
            <Switch checked={tool.enabled} onCheckedChange={() => toggleTool(tool.id)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
