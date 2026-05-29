'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Copy, Plus, Key, Terminal, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getApiKeys, createApiKey, deleteApiKey } from './actions';
import { useTranslations } from 'next-intl';

type ApiKeyData = {
    id: number;
    name: string;
    key: string;
    createdAt: Date;
    lastUsedAt: Date | null;
};

export default function DevelopersPage() {
    const t = useTranslations('Settings');
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        setLoading(true);
        try {
            const data = await getApiKeys();
            setKeys(data);
        } catch (error) {
            toast.error(t('failed_to_load_api_keys_toast'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newKeyName.trim()) return;
        setIsCreating(true);
        try {
            const result = await createApiKey(newKeyName);
            if (result.success && result.key) {
                setNewlyCreatedKey(result.key);
                setNewKeyName('');
                loadKeys();
            }
        } catch (error) {
            toast.error(t('failed_to_create_api_key_toast'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('confirm_revoke_key'))) return;
        try {
            await deleteApiKey(id);
            toast.success(t('api_key_revoked_toast'));
            loadKeys();
        } catch (error) {
            toast.error(t('failed_to_revoke_key_toast'));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t('copied_to_clipboard_toast'));
    };

    const toggleVisibility = (id: number) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const maskKey = (key: string) => {
        return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
    };

    const apiBase = 'https://api.kyrn.nl/v1';
    const authHeader = '-H "Authorization: Bearer sk_live_..."';

    return (
        <section className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('developer_api_title')}</h1>
                    <p className="text-muted-foreground">{t('developer_api_desc')}</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t('create_new_key_btn')}
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> {t('api_keys_card_title')}</CardTitle>
                        <CardDescription>{t('api_keys_card_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : keys.length === 0 ? (
                            <div className="text-center p-6 text-muted-foreground">{t('no_api_keys_generated_yet')}</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('name_table_header')}</TableHead>
                                        <TableHead>{t('token_table_header')}</TableHead>
                                        <TableHead>{t('created_table_header')}</TableHead>
                                        <TableHead>{t('last_used_table_header')}</TableHead>
                                        <TableHead className="text-right">{t('actions_table_header')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keys.map(key => (
                                        <TableRow key={key.id}>
                                            <TableCell className="font-medium">{key.name}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span>{visibleKeys[key.id] ? key.key : maskKey(key.key)}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(key.id)}>
                                                        {visibleKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.key)}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : t('never_text')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(key.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" /> {t('documentation_card_title')}</CardTitle>
                        <CardDescription>Volledige API voor WhatsApp, templates, chats en voice agents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid gap-3 md:grid-cols-3">
                            {[
                                ['Authenticatie', 'Gebruik Authorization: Bearer sk_live_...'],
                                ['WhatsApp', 'Berichten, instances, chats en templates.'],
                                ['Voice agents', 'Agents, workflow definitions en API-runs.'],
                            ].map(([title, description]) => (
                                <div key={title} className="rounded-lg border bg-muted/30 p-3">
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                                </div>
                            ))}
                        </div>

                        <Tabs defaultValue="whatsapp-send">
                            <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
                                <TabsTrigger value="whatsapp-send">WhatsApp verzenden</TabsTrigger>
                                <TabsTrigger value="whatsapp-data">WhatsApp data</TabsTrigger>
                                <TabsTrigger value="voice-agents">Voice Agents</TabsTrigger>
                                <TabsTrigger value="voice-runs">Voice runs</TabsTrigger>
                                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                            </TabsList>

                            <TabsContent value="whatsapp-send" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Endpoint</Label>
                                    <div className="bg-muted p-2 rounded-md font-mono text-sm">POST /v1/send</div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tekstbericht</Label>
                                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                        {`curl -X POST "${apiBase}/send" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceName": "my-instance-name",
    "number": "5511999999999",
    "type": "text",
    "message": "Hallo vanuit de API!"
  }'`}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <Label>Media of document</Label>
                                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                        {`curl -X POST "${apiBase}/send" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceName": "my-instance-name",
    "number": "5511999999999",
    "type": "image",
    "mediaUrl": "https://example.com/image.png",
    "message": "Optionele tekst bij de afbeelding"
  }'`}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <Label>Audio</Label>
                                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                        {`curl -X POST "${apiBase}/send" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceName": "my-instance-name",
    "number": "5511999999999",
    "type": "audio",
    "mediaUrl": "https://example.com/audio.mp3"
  }'`}
                                    </pre>
                                </div>
                            </TabsContent>

                            <TabsContent value="whatsapp-data" className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <EndpointPill method="GET" path="/v1/whatsapp/instances" />
                                    <EndpointPill method="GET" path="/v1/whatsapp/chats?instanceName=my-instance-name&limit=50" />
                                    <EndpointPill method="GET" path="/v1/whatsapp/templates?instanceName=my-instance-name" />
                                </div>
                                <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                    {`curl "${apiBase}/whatsapp/chats?instanceName=my-instance-name&limit=50" \\
  ${authHeader}`}
                                </pre>
                                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    Gebruik deze endpoints om gekoppelde WhatsApp instances, inboxgesprekken en WABA templates uit je workspace te lezen.
                                </div>
                            </TabsContent>

                            <TabsContent value="voice-agents" className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <EndpointPill method="GET" path="/v1/voice/agents" />
                                    <EndpointPill method="POST" path="/v1/voice/agents" />
                                    <EndpointPill method="GET" path="/v1/voice/agents/{agentId}/definition" />
                                    <EndpointPill method="PATCH" path="/v1/voice/agents/{agentId}/definition" />
                                    <EndpointPill method="POST" path="/v1/voice/agents/{agentId}/definition" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Voice agent aanmaken</Label>
                                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                        {`curl -X POST "${apiBase}/voice/agents" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Inbound support agent",
    "description": "Handelt inkomende gesprekken en WhatsApp-overdracht af",
    "channelMode": "whatsapp_voice",
    "systemPrompt": "Begroet de beller, kwalificeer de aanvraag en vat de vervolgstappen samen.",
    "isDefaultForWhatsapp": true
  }'`}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <Label>Workflow opslaan of publiceren</Label>
                                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                        {`curl -X PATCH "${apiBase}/voice/agents/3/definition" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{ "workflowJson": { "nodes": [], "edges": [] } }'

curl -X POST "${apiBase}/voice/agents/3/definition" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{ "definitionId": 12 }'`}
                                    </pre>
                                </div>
                            </TabsContent>

                            <TabsContent value="voice-runs" className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <EndpointPill method="GET" path="/v1/voice/runs?agentId=3&limit=50" />
                                    <EndpointPill method="POST" path="/v1/voice/runs" />
                                </div>
                                <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                                    {`curl -X POST "${apiBase}/voice/runs" \\
  ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": 3,
    "channel": "api",
    "direction": "outbound",
    "input": "Start een kwalificatiegesprek voor een nieuwe lead.",
    "toNumber": "+31612345678"
  }'`}
                                </pre>
                            </TabsContent>

                            <TabsContent value="webhooks" className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <EndpointPill method="POST" path="/api/webhook/evolution" />
                                    <EndpointPill method="POST" path="/api/webhook/meta-cloud" />
                                    <EndpointPill method="POST" path="/api/webhook/twilio/voice" />
                                    <EndpointPill method="POST" path="/api/voice/runtime/events" />
                                </div>
                                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    Webhooks verwerken inkomende WhatsApp-events, Meta Cloud events, Twilio voice callbacks en realtime voice runtime events. Gebruik API keys voor outbound v1 endpoints; provider webhook secrets blijven apart ingesteld.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    {!newlyCreatedKey ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t('create_api_key_dialog_title')}</DialogTitle>
                                <DialogDescription>{t('create_api_key_dialog_desc')}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>{t('key_name_label')}</Label>
                                <Input
                                    placeholder={t('zapier_integration_placeholder')}
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t('cancel_btn')}</Button>
                                <Button onClick={handleCreate} disabled={isCreating || !newKeyName}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('create_btn')}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-green-600">{t('key_created_successfully_dialog_title')}</DialogTitle>
                                <DialogDescription>
                                    {t('key_created_successfully_dialog_desc')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <div className="flex items-center gap-2 p-3 bg-muted rounded border border-primary/20">
                                    <code className="flex-1 font-mono text-sm break-all text-primary">{newlyCreatedKey}</code>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(newlyCreatedKey)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => { setIsCreateOpen(false); setNewlyCreatedKey(null); }}>{t('done_btn')}</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

function EndpointPill({ method, path }: { method: string; path: string }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-3">
            <span className="mr-2 rounded bg-background px-2 py-1 font-mono text-xs font-semibold">{method}</span>
            <code className="break-all text-xs">{path}</code>
        </div>
    );
}
