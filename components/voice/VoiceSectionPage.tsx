'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import {
  Bot,
  Cable,
  Code2,
  FileText,
  Megaphone,
  Mic,
  Phone,
  Play,
  Radio,
  Settings2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const sections = [
  { key: 'agents', href: '/voice', label: 'Voice Agents', icon: Bot },
  { key: 'campaigns', href: '/voice/campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'models', href: '/voice/models', label: 'Models', icon: Settings2 },
  { key: 'telephony', href: '/voice/telephony', label: 'Telephony', icon: Phone },
  { key: 'tools', href: '/voice/tools', label: 'Tools', icon: Wrench },
  { key: 'files', href: '/voice/files', label: 'Files', icon: FileText },
  { key: 'recordings', href: '/voice/recordings', label: 'Recordings', icon: Mic },
  { key: 'developers', href: '/voice/developers', label: 'Developers', icon: Code2 },
  { key: 'runs', href: '/voice/runs', label: 'Agent Runs', icon: Play },
  { key: 'reports', href: '/voice/reports', label: 'Reports', icon: Radio },
] as const;

type SectionKey = (typeof sections)[number]['key'];

const endpointBySection: Record<SectionKey, string> = {
  agents: '/api/voice/agents',
  campaigns: '/api/voice/campaigns',
  models: '/api/voice/models',
  telephony: '/api/voice/telephony',
  tools: '/api/voice/tools',
  files: '/api/voice/files',
  recordings: '/api/voice/recordings',
  developers: '/api/voice/developers',
  runs: '/api/voice/runs',
  reports: '/api/voice/reports',
};

const listKeyBySection: Record<SectionKey, string> = {
  agents: 'agents',
  campaigns: 'campaigns',
  models: 'models',
  telephony: 'telephony',
  tools: 'tools',
  files: 'files',
  recordings: 'recordings',
  developers: 'apiKeys',
  runs: 'runs',
  reports: 'reports',
};

export function VoiceSectionPage({ section }: { section: SectionKey }) {
  const endpoint = endpointBySection[section];
  const { data, isLoading } = useSWR(endpoint, fetcher);
  const { data: overview } = useSWR('/api/voice/overview', fetcher);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const active = sections.find((item) => item.key === section)!;
  const Icon = active.icon;

  const rows = useMemo(() => data?.[listKeyBySection[section]] || [], [data, section]);
  const canCreate = !['developers', 'runs', 'reports'].includes(section);

  async function createRecord() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const body: Record<string, any> = { name };
      if (section === 'agents') {
        body.systemPrompt = prompt;
        body.isDefaultForWhatsapp = true;
      }
      if (section === 'campaigns') {
        body.agentId = data?.agents?.[0]?.id || 1;
      }
      if (section === 'files') {
        body.contentText = prompt;
      }
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setName('');
      setPrompt('');
      mutate(endpoint);
      mutate('/api/voice/overview');
    } finally {
      setBusy(false);
    }
  }

  async function runAgent(agentId: number) {
    setBusy(true);
    try {
      await fetch('/api/voice/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          channel: 'api',
          input: input || 'Run a quick test conversation.',
        }),
      });
      mutate('/api/voice/runs');
      mutate('/api/voice/overview');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/40">
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">Voice Suite</CardTitle>
              <CardDescription>Shared WhatsApp and phone agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {sections.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link key={item.key} href={item.href}>
                    <Button variant={item.key === section ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                      <ItemIcon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Icon className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">{active.label}</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Native Dograh-inspired voice agents inside WhatSaaS.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {overview?.credits ?? 0} team credits
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ['Agents', overview?.metrics?.agents],
              ['Runs', overview?.metrics?.runs],
              ['Campaigns', overview?.metrics?.campaigns],
              ['Recordings', overview?.metrics?.recordings],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{value ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {canCreate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create {active.label.slice(0, -1)}</CardTitle>
                <CardDescription>Add a team-scoped resource for this voice workspace.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
                {['agents', 'files'].includes(section) && (
                  <Textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={section === 'agents' ? 'System prompt' : 'File text'}
                    rows={4}
                  />
                )}
                <Button className="w-fit" onClick={createRecord} disabled={busy || !name.trim()}>
                  Create
                </Button>
              </CardContent>
            </Card>
          )}

          {section === 'agents' && rows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Agent</CardTitle>
                <CardDescription>Starts a standalone run and reconciles team credits.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Test message" />
                <Button onClick={() => runAgent(rows[0].id)} disabled={busy}>
                  <Play className="mr-2 h-4 w-4" />
                  Run first agent
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{active.label}</CardTitle>
              <CardDescription>{isLoading ? 'Loading...' : `${rows.length} records`}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        No records yet.
                      </TableCell>
                    </TableRow>
                  ) : rows.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name || row.agentName || row.endpoint || `#${row.id}`}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.status || row.provider || row.channel || 'active'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                        {row.description || row.transcript || row.llmModel || row.phoneNumber || row.category || row.error || row.creditsUsed || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {section === 'developers' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cable className="h-4 w-4" />
                  Developer Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {(data?.endpoints || []).map((endpoint: string) => (
                  <div key={endpoint} className="rounded border bg-background px-3 py-2 font-mono">{endpoint}</div>
                ))}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
