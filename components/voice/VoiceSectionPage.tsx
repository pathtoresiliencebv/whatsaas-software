'use client';

import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getSmoothStepPath,
} from '@xyflow/react';
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Cable,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  EyeOff,
  FileAudio,
  FileText,
  FolderPlus,
  GitBranch,
  Globe2,
  Headphones,
  KeyRound,
  Loader2,
  MessageSquare,
  Mic,
  MoreVertical,
  PanelLeft,
  Pencil,
  Phone,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Logo from '@/components/interface/Logo';
import { WorkspaceThemeToggle } from '@/components/workspace/WorkspaceThemeToggle';
import { useTheme } from 'next-themes';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SectionKey =
  | 'agents'
  | 'campaigns'
  | 'models'
  | 'telephony'
  | 'tools'
  | 'files'
  | 'recordings'
  | 'developers'
  | 'runs'
  | 'reports';

type VoiceNavItem = {
  key: SectionKey;
  href: string;
  label: string;
  icon: LucideIcon;
};

const navGroups: Array<{ title: string; items: VoiceNavItem[] }> = [
  {
    title: 'BUILD',
    items: [
      { key: 'agents', href: '/voice', label: 'Spraakagents', icon: GitBranch },
      { key: 'campaigns', href: '/voice/campaigns', label: 'Campagnes', icon: Radio },
      { key: 'models', href: '/voice/models', label: 'Modellen', icon: Settings2 },
      { key: 'telephony', href: '/voice/telephony', label: 'Telefonie', icon: Phone },
  { key: 'tools', href: '/voice/tools', label: 'Tools', icon: Wrench },
  { key: 'files', href: '/voice/files', label: 'Bestanden', icon: Database },
  { key: 'recordings', href: '/voice/recordings', label: 'Opnames', icon: FileAudio },
  { key: 'developers', href: '/voice/developers', label: 'Ontwikkelaars', icon: KeyRound },
    ],
  },
  {
    title: 'OBSERVE',
    items: [
      { key: 'runs', href: '/voice/runs', label: 'Agentruns', icon: BarChart3 },
  { key: 'reports', href: '/voice/reports', label: 'Rapporten', icon: FileText },
    ],
  },
] ;

const sections = navGroups.flatMap((group) => group.items);
type DialogName = 'agent' | 'uploadAgent' | 'folder' | 'campaign' | 'telephony' | 'tool' | 'file' | 'recording' | null;
type AgentPanel = 'agent' | 'workflow' | 'branches' | 'widget' | 'tests' | 'users';
type WorkflowSidePanelMode = 'test' | 'options' | 'versions' | 'phone' | 'more';
type FlowNodeKind = 'start' | 'global' | 'agent' | 'qa' | 'webhook' | 'end';
type AddableFlowNodeKind = Exclude<FlowNodeKind, 'start' | 'global' | 'end'>;

type FlowNode = {
  id: string;
  kind: FlowNodeKind;
  title: string;
  badge: string;
  prompt: string;
  greetingType?: string;
  greetingText?: string;
  allowInterruption?: boolean;
  x: number;
  y: number;
};

type WorkflowValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

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

const nodeSeeds: FlowNode[] = [
  {
    id: 'start',
    kind: 'start',
    title: 'gesprek starten',
    badge: 'Startnode',
    x: 380,
    y: 92,
    prompt:
      '# HOOFDDOEL IN DEZE STAP\nJe ontvangt een inkomend gesprek van een gebruiker. Begroet de gebruiker, vertel je naam en bedrijfsnaam als die beschikbaar zijn, vraag naar hun naam en vraag hoe je kunt helpen.',
  },
  {
    id: 'global',
    kind: 'global',
    title: 'Globale context',
    badge: 'Globale node',
    x: 80,
    y: 402,
    prompt:
      '# ALGEMEEN DOEL\nHoud elk antwoord kort, behulpzaam en passend bij deze teamworkflow. Gebruik gekoppelde tools, bestanden en variabelen wanneer die beschikbaar zijn.',
  },
  {
    id: 'agent',
    kind: 'agent',
    title: 'Hoofdagenda en vragen',
    badge: 'Agentnode',
    x: 720,
    y: 402,
    prompt:
      '# HOOFDDOEL IN DEZE STAP\nBegrijp de behoefte van de beller, verzamel de belangrijkste details en beslis of je antwoordt, doorverbindt of het gesprek afrondt.',
  },
  {
    id: 'end',
    kind: 'end',
    title: 'Gesprek afronden',
    badge: 'Eindnode',
    x: 390,
    y: 700,
    prompt:
      '# HOOFDDOEL IN DEZE STAP\nHet gesprek is compleet. Bedank de beller netjes, vat de uitkomst samen en rond het gesprek af.',
  },
];

const nodeTone = {
  start: 'border-emerald-500/70 bg-emerald-500/10 text-emerald-700 dark:bg-transparent dark:text-emerald-300',
  global: 'border-amber-500/70 bg-amber-500/10 text-amber-700 dark:bg-transparent dark:text-amber-300',
  agent: 'border-blue-500/70 bg-blue-500/10 text-blue-700 dark:bg-transparent dark:text-blue-300',
  qa: 'border-violet-500/70 bg-violet-500/10 text-violet-700 dark:bg-transparent dark:text-violet-300',
  webhook: 'border-cyan-500/70 bg-cyan-500/10 text-cyan-700 dark:bg-transparent dark:text-cyan-300',
  end: 'border-rose-500/70 bg-rose-500/10 text-rose-700 dark:bg-transparent dark:text-rose-300',
};

const workflowModuleTemplates: Record<AddableFlowNodeKind, {
  label: string;
  shortLabel: string;
  badge: string;
  icon: LucideIcon;
  prompt: string;
}> = {
  agent: {
    label: 'Agentstap',
    shortLabel: 'Agent',
    badge: 'Agentnode',
    icon: Bot,
    prompt:
      '# HOOFDDOEL IN DEZE STAP\nBeschrijf wat deze stap moet doen, welke informatie nodig is en wanneer de workflow verder mag.',
  },
  qa: {
    label: 'Vraag en antwoord',
    shortLabel: 'Q&A',
    badge: 'Q&A-node',
    icon: MessageSquare,
    prompt:
      '# VRAAG EN ANTWOORD\nBeantwoord veelgestelde vragen kort en duidelijk. Als je het antwoord niet zeker weet, bied een overdracht of vervolgstap aan.',
  },
  webhook: {
    label: 'Webhook / tool',
    shortLabel: 'Webhook',
    badge: 'Toolnode',
    icon: Wrench,
    prompt:
      '# TOOLACTIE\nGebruik deze stap om gegevens door te sturen, een webhook aan te roepen of een externe actie voor te bereiden. Vat daarna kort samen wat er is gebeurd.',
  },
};

const voiceSidebarText = 'text-[hsl(240_1.7%_11.2%)] dark:text-zinc-300';
const voiceSidebarTextStrong = 'text-[hsl(240_1.7%_11.2%)] dark:text-white';
const voiceSidebarMuted = 'text-zinc-500 dark:text-zinc-400';
const voiceSidebarItemIdle = 'text-[hsl(240_1.7%_11.2%)] hover:bg-[#0000170b] hover:text-[hsl(240_1.7%_11.2%)] dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white';
const voiceSidebarItemActive = 'bg-[#0000170b] text-[hsl(240_1.7%_11.2%)] shadow-sm dark:bg-[#1b211d] dark:text-white';
const voicePageText = 'text-[hsl(240_1.7%_11.2%)] dark:text-[#f6f7fb]';
const voicePageMuted = 'text-zinc-500 dark:text-zinc-400';
const voicePanelClass = 'border border-zinc-200 bg-white shadow-sm dark:border-[#303030] dark:bg-[#171717]';
const voiceSoftPanelClass = 'border border-zinc-200 bg-[#fbfbfa] dark:border-[#2f2f2f] dark:bg-[#101010]';
const voiceHoverSurface = 'hover:bg-[#0000170b] dark:hover:bg-[#242424]';

export function VoiceSectionPage({ section }: { section: SectionKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const endpoint = endpointBySection[section];
  const { data, isLoading } = useSWR(endpoint, fetcher);
  const { data: overview } = useSWR('/api/voice/overview', fetcher);
  const { data: agentData } = useSWR('/api/voice/agents', fetcher);
  const { data: telephonyData } = useSWR('/api/voice/telephony', fetcher);
  const { data: runData } = useSWR('/api/voice/runs', fetcher);
  const { data: reportData } = useSWR('/api/voice/reports', fetcher);

  const rows = useMemo<any[]>(() => data?.[listKeyBySection[section]] || [], [data, section]);
  const agents = (agentData?.agents || (section === 'agents' ? rows : [])) as any[];
  const telephony = (telephonyData?.telephony || (section === 'telephony' ? rows : [])) as any[];
  const runs = (runData?.runs || (section === 'runs' ? rows : [])) as any[];
  const reports = (reportData?.reports || (section === 'reports' ? rows : [])) as any[];

  const [dialog, setDialog] = useState<DialogName>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error' | 'info'; message: string } | null>(null);
  const [createStep, setCreateStep] = useState<'form' | 'creating' | 'success'>('form');
  const [createError, setCreateError] = useState('');
  const [createdAgent, setCreatedAgent] = useState<any>(null);
  const [editorAgent, setEditorAgent] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [testMode, setTestMode] = useState<'audio' | 'chat'>('audio');
  const [testRunning, setTestRunning] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [testTranscript, setTestTranscript] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([]);
  const [runtimeSession, setRuntimeSession] = useState<any>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [firstCallTip, setFirstCallTip] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState('start');
  const [editNode, setEditNode] = useState<FlowNode | null>(null);
  const [nodes, setNodes] = useState(nodeSeeds);

  const [agentForm, setAgentForm] = useState({
    callType: 'inbound',
    useCase: '',
    activityDescription: '',
  });
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    agentId: '',
    telephonyConfigId: '',
    sourceType: 'csv',
    maxConcurrency: 1,
    leadRows: [] as Array<Record<string, string>>,
    leadFileName: '',
    aiPrompt: '',
    selectedTemplate: '',
    manualLeadText: '',
    contactSegment: '',
    retryCount: 2,
    callWindow: 'business',
  });
  const [modelTab, setModelTab] = useState<'llm' | 'voice' | 'transcriber' | 'embedding'>('llm');
  const [modelForm, setModelForm] = useState({
    provider: 'gemini-live',
    model: 'gemini-3.1-flash-live-preview',
    apiKey: '',
    realtime: true,
  });
  const [telephonyForm, setTelephonyForm] = useState({
    name: '',
    provider: 'twilio',
    endpoint: '',
    accountSid: '',
    authToken: '',
    isDefaultOutbound: false,
  });
  const [toolForm, setToolForm] = useState({
    name: '',
    category: 'http_api',
    description: '',
    endpoint: '',
    method: 'POST',
    transferNumber: '',
    expression: '',
  });
  const [fileForm, setFileForm] = useState({
    name: '',
    contentText: '',
    mimeType: 'application/pdf',
  });
  const [recordingForm, setRecordingForm] = useState({
    name: '',
    transcript: '',
    language: 'auto',
  });
  const [folderForm, setFolderForm] = useState({ name: '' });
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const routeAgentId = Number(searchParams.get('agentId') || 0);
  const routePanel = searchParams.get('panel') as AgentPanel | null;
  const activeAgent = selectedAgent || (routeAgentId ? agents.find((agent) => Number(agent.id) === routeAgentId) : null) || null;
  const activeAgentPanel: AgentPanel = routePanel === 'workflow' || routePanel === 'branches' || routePanel === 'widget' || routePanel === 'tests' || routePanel === 'users' ? routePanel : 'agent';
  const { data: definitionData } = useSWR(activeAgent?.id ? `/api/voice/agents/${activeAgent.id}/definition` : null, fetcher);

  async function postJson(url: string, body: Record<string, any>) {
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Request failed');
      mutate(url);
      mutate('/api/voice/overview');
      return payload;
    } finally {
      setBusy(false);
    }
  }

  async function saveAgent(agent: any, updates: Record<string, any>) {
    setBusy(true);
    try {
      const response = await fetch('/api/voice/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          ...updates,
        }),
      });
      const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Agent kon niet worden opgeslagen');
      if (payload.agent) {
        setSelectedAgent(payload.agent);
        setEditorAgent((current: any) => (current?.id === payload.agent.id ? payload.agent : current));
      }
      mutate('/api/voice/agents');
      mutate('/api/voice/overview');
      return payload.agent;
    } finally {
      setBusy(false);
    }
  }

  async function createAgent() {
    if (!agentForm.useCase.trim() || !agentForm.activityDescription.trim()) return;
    setNotice(null);
    setCreateError('');
    setCreateStep('creating');
    try {
      const systemPrompt = buildAgentPrompt(agentForm.useCase, agentForm.activityDescription, agentForm.callType);
      const payload = {
        name: `${agentForm.useCase.trim()} - ${agentForm.callType}`,
        description: agentForm.activityDescription,
        systemPrompt,
        channelMode: agentForm.callType === 'inbound' ? 'whatsapp_voice' : 'voice_only',
        isDefaultForWhatsapp: true,
      };
      const result = await postJson('/api/voice/agents', payload);
      setCreatedAgent(result.agent);
      setSelectedAgent(result.agent);
      setEditorAgent(result.agent);
      setNotice({ type: 'ok', message: 'Voice agent aangemaakt.' });
      setCreateStep('success');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Workflow kon niet worden aangemaakt.');
      setCreateStep('form');
    }
  }

  async function createCampaign() {
    const agentId = Number(campaignForm.agentId || agents[0]?.id);
    if (!campaignForm.name.trim() || !agentId) return;
    setNotice(null);
    try {
      const result = await postJson('/api/voice/campaigns', {
        name: campaignForm.name,
        agentId,
        telephonyConfigId: campaignForm.telephonyConfigId || null,
        sourceType: campaignForm.sourceType,
        totalLeads: campaignForm.leadRows.length,
        maxConcurrency: campaignForm.maxConcurrency,
        retryConfig: { retries: campaignForm.retryCount || 2, retryDelayMinutes: 30 },
        scheduleConfig: { timezone: 'Europe/Amsterdam', windows: [], callWindow: campaignForm.callWindow || 'business' },
      });
      if (campaignForm.leadRows.length && result.campaign?.id) {
        await postJson(`/api/voice/campaigns/${result.campaign.id}/leads`, {
          rows: campaignForm.leadRows,
        });
      }
      setNotice({ type: 'ok', message: 'Campagne opgeslagen. Leads en instellingen staan klaar.' });
      setCampaignForm({
        name: '',
        agentId: '',
        telephonyConfigId: '',
        sourceType: 'csv',
        maxConcurrency: 1,
        leadRows: [],
        leadFileName: '',
        aiPrompt: '',
        selectedTemplate: '',
        manualLeadText: '',
        contactSegment: '',
        retryCount: 2,
        callWindow: 'business',
      });
      setDialog(null);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Campagne kon niet worden opgeslagen.' });
    }
  }

  async function createModelConfig() {
    if (!modelForm.provider.trim()) return;
    const result = await postJson('/api/voice/models', {
      name: `${modelForm.provider} ${modelTab} stack`,
      llmProvider: modelTab === 'llm' ? modelForm.provider : 'gemini-live',
      llmModel: modelTab === 'llm' ? modelForm.model : 'gemini-3.1-flash-live-preview',
      llmApiKey: modelForm.apiKey || null,
      sttProvider: modelTab === 'transcriber' ? modelForm.provider : 'openai',
      sttModel: modelTab === 'transcriber' ? modelForm.model : 'gpt-realtime-whisper',
      ttsProvider: modelTab === 'voice' ? modelForm.provider : 'google-chirp',
      ttsModel: modelTab === 'voice' ? modelForm.model : 'chirp-3-hd',
      isDefault: true,
    });
    mutate('/api/voice/models');
    return result;
  }

  async function createTelephony() {
    if (!telephonyForm.name.trim()) return;
    setNotice(null);
    try {
      await postJson('/api/voice/telephony', {
        name: telephonyForm.name,
        provider: telephonyForm.provider,
        credentials: {
          endpoint: telephonyForm.endpoint,
          accountSid: telephonyForm.accountSid,
          authToken: telephonyForm.authToken,
        },
        isDefaultOutbound: telephonyForm.isDefaultOutbound,
      });
      setNotice({ type: 'ok', message: 'Telefonieconfiguratie opgeslagen.' });
      setTelephonyForm({ name: '', provider: 'twilio', endpoint: '', accountSid: '', authToken: '', isDefaultOutbound: false });
      setDialog(null);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Telefonieconfiguratie kon niet worden opgeslagen.' });
    }
  }

  async function createTool() {
    if (!toolForm.name.trim()) return;
    setNotice(null);
    try {
      await postJson('/api/voice/tools', {
        name: toolForm.name,
        description: toolForm.description,
        category: toolForm.category,
        definition: {
          endpoint: toolForm.endpoint,
          method: toolForm.method,
          transferNumber: toolForm.transferNumber,
          expression: toolForm.expression,
          timeoutMs: 10000,
        },
        status: 'active',
      });
      setNotice({ type: 'ok', message: 'Tool opgeslagen en beschikbaar voor workflows.' });
      setToolForm({ name: '', category: 'http_api', description: '', endpoint: '', method: 'POST', transferNumber: '', expression: '' });
      setDialog(null);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Tool kon niet worden opgeslagen.' });
    }
  }

  async function createFile() {
    if (!fileForm.name.trim()) return;
    setNotice(null);
    try {
      await postJson('/api/voice/files', {
        name: fileForm.name,
        mimeType: fileForm.mimeType,
        contentText: fileForm.contentText,
        processingStatus: 'ready',
        metadata: { source: 'kyrn_voice_ui' },
      });
      setNotice({ type: 'ok', message: 'Document opgeslagen in de kennisbank.' });
      setFileForm({ name: '', contentText: '', mimeType: 'application/pdf' });
      setDialog(null);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Document kon niet worden opgeslagen.' });
    }
  }

  async function createRecording() {
    if (!recordingForm.name.trim()) return;
    setNotice(null);
    try {
      await postJson('/api/voice/recordings', {
        name: recordingForm.name,
        transcript: recordingForm.transcript,
        metadata: { language: recordingForm.language },
      });
      setNotice({ type: 'ok', message: 'Opname opgeslagen.' });
      setRecordingForm({ name: '', transcript: '', language: 'auto' });
      setDialog(null);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Opname kon niet worden opgeslagen.' });
    }
  }

  async function runAgent(agent: any) {
    setTestRunning(true);
    setTestEnded(false);
    setTestTranscript([{ role: 'system', content: 'Browser-testgesprek wordt gestart...' }]);
    try {
      const session = await postJson('/api/voice/web-call/token', {
        agentId: agent.id,
      });
      setRuntimeSession(session);
      setTestTranscript((current) => [
        ...current,
        { role: 'user', content: 'Hallo, ik test deze Kyrn-spraakagent in de browser.' },
      ]);

      await postJson('/api/voice/runtime/events', {
        runId: session.run.id,
        event: {
          type: 'transcript.user',
          text: 'Hallo, ik test deze Kyrn-spraakagent in de browser.',
          at: new Date().toISOString(),
        },
      });
      await postJson('/api/voice/runtime/events', {
        runId: session.run.id,
        event: {
          type: 'transcript.agent',
          text: agent.firstMessage || 'Hallo, ik ben je Kyrn-spraakagent. Waarmee kan ik je vandaag helpen?',
          at: new Date().toISOString(),
        },
      });
      setTestTranscript((current) => [
        ...current,
        { role: 'assistant', content: agent.firstMessage || 'Hallo, ik ben je Kyrn-spraakagent. Waarmee kan ik je vandaag helpen?' },
      ]);
      await postJson(`/api/voice/runs/${session.run.id}/end`, {
        status: 'completed',
        usage: {
          durationSeconds: 7,
          llmTokens: 400,
          ttsCharacters: 120,
          telephonySeconds: 0,
        },
      });
      mutate('/api/voice/runs');
    } finally {
      setTestEnded(true);
      setTestRunning(false);
    }
  }

  async function saveWorkflow(agent: any, currentNodes: FlowNode[], publish = false) {
    setBusy(true);
    setNotice(null);
    try {
      const validation = validateFlowNodes(currentNodes);
      if (!validation.valid) {
        throw new Error(validation.errors[0] || 'Workflow is nog niet compleet.');
      }
      const response = await fetch(`/api/voice/agents/${agent.id}/definition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowJson: buildWorkflowPayload(agent, currentNodes),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Workflow kon niet worden opgeslagen');

      if (publish) {
        const publishResponse = await fetch(`/api/voice/agents/${agent.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ definitionId: payload.definition?.id }),
        });
        const publishPayload = await publishResponse.json().catch(() => ({}));
        if (!publishResponse.ok) throw new Error(publishPayload.error || 'Workflow kon niet worden gepubliceerd');
      }

      setUnsaved(false);
      setNotice({ type: 'ok', message: publish ? 'Workflow opgeslagen en gepubliceerd.' : 'Workflow opgeslagen als draft.' });
      mutate(`/api/voice/agents/${agent.id}/definition`);
      mutate('/api/voice/agents');
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Workflow kon niet worden opgeslagen.' });
      throw error;
    } finally {
      setBusy(false);
    }
  }

  function openEditor(agent: any) {
    setSelectedAgent(agent);
    setEditorAgent(agent);
    setSelectedNodeId('start');
    setTestEnded(false);
    setFirstCallTip(true);
    setNodes(nodeSeeds.map((node) => (
      node.id === 'start' && agent.systemPrompt ? { ...node, prompt: agent.systemPrompt } : node
    )));
    router.push(`/voice?agentId=${agent.id}&panel=workflow`);
  }

  const visibleEditorAgent = editorAgent || (section === 'agents' && activeAgentPanel === 'workflow' ? activeAgent : null);

  useEffect(() => {
    if (!visibleEditorAgent || editorAgent || unsaved) return;
    const nextNodes = definitionData?.definition
      ? definitionToFlowNodes(definitionData.definition)
      : nodeSeeds.map((node) => (
        node.id === 'start' && visibleEditorAgent?.systemPrompt ? { ...node, prompt: visibleEditorAgent.systemPrompt } : node
      ));
    setNodes(nextNodes);
    if (!nextNodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(nextNodes[0]?.id || 'start');
    }
  }, [definitionData?.definition, editorAgent, selectedNodeId, unsaved, visibleEditorAgent]);

  const visibleEditorNodes = nodes;

  function addWorkflowNode(kind: AddableFlowNodeKind = 'agent') {
    const template = workflowModuleTemplates[kind];
    const newNodeId = `${kind}-${Date.now()}`;
    const newNode: FlowNode = {
      id: newNodeId,
      kind,
      title: `Nieuwe ${template.shortLabel.toLowerCase()} stap`,
      badge: template.badge,
      prompt: template.prompt,
      x: 720,
      y: 560,
    };

    setNodes((current) => {
      const selected = current.find((node) => node.id === selectedNodeId);
      const moduleCount = current.filter((node) => isWorkflowModuleNode(node)).length;
      const basePosition = {
        x: selected ? selected.x : 720,
        y: selected ? selected.y + 220 : 500 + moduleCount * 160,
      };
      while (current.some((node) => Math.abs(node.x - basePosition.x) < 140 && Math.abs(node.y - basePosition.y) < 120)) {
        basePosition.y += 190;
        if (basePosition.y > 880) {
          basePosition.x += 340;
          basePosition.y = 420;
        }
      }
      const positionedNode = {
        ...newNode,
        x: basePosition.x,
        y: basePosition.y,
      };
      setSelectedNodeId(positionedNode.id);
      setEditNode(positionedNode);
      return [...current, positionedNode];
    });
    setUnsaved(true);
  }

  if (section === 'agents' && visibleEditorAgent) {
    return (
      <VoiceWorkspace
        section={section}
        agents={agents}
        selectedAgent={visibleEditorAgent}
        agentMenuMode="workflow"
        agentPanel="workflow"
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          setEditorAgent(null);
        }}
        onBackToWorkspace={() => {
          setSelectedAgent(null);
          setEditorAgent(null);
        }}
        onCreateAgent={() => {
          setCreateStep('form');
          setCreateError('');
          setDialog('agent');
        }}
        onOpenWorkflow={openEditor}
      >
        <VoiceNotice notice={notice} onClose={() => setNotice(null)} />
        <EditorView
          agent={visibleEditorAgent}
          nodes={visibleEditorNodes}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          setEditNode={setEditNode}
          onBack={() => {
            setEditorAgent(null);
            router.push(`/voice?agentId=${visibleEditorAgent.id}`);
          }}
          onRun={() => runAgent(visibleEditorAgent)}
          testMode={testMode}
          setTestMode={setTestMode}
          testRunning={testRunning}
          testEnded={testEnded}
          testTranscript={testTranscript}
          runtimeSession={runtimeSession}
          unsaved={unsaved}
          onSaveWorkflow={(publish) => saveWorkflow(visibleEditorAgent, visibleEditorNodes, publish)}
          onAddNode={addWorkflowNode}
          onMoveNode={(nodeId, position) => {
            setNodes((current) => current.map((node) => node.id === nodeId ? { ...node, x: position.x, y: position.y } : node));
            setUnsaved(true);
          }}
          firstCallTip={firstCallTip}
          setFirstCallTip={setFirstCallTip}
          editNode={editNode}
          onCloseEditNode={() => setEditNode(null)}
          onSaveEditNode={(nextNode) => {
            setNodes((current) => current.map((node) => node.id === nextNode.id ? nextNode : node));
            setUnsaved(true);
            setEditNode(null);
          }}
        />
      </VoiceWorkspace>
    );
  }

  return (
    <VoiceWorkspace
      section={section}
      agents={agents}
      selectedAgent={activeAgent}
      agentMenuMode="agent"
      agentPanel={activeAgentPanel}
      onSelectAgent={(agent) => {
        setSelectedAgent(agent);
        setEditorAgent(null);
      }}
      onBackToWorkspace={() => {
        setSelectedAgent(null);
        setEditorAgent(null);
        router.push(section === 'agents' ? '/voice' : endpointBySection[section].replace('/api', ''));
      }}
      onCreateAgent={() => {
        setCreateStep('form');
        setCreateError('');
        setDialog('agent');
      }}
      onOpenWorkflow={openEditor}
    >
      <VoiceNotice notice={notice} onClose={() => setNotice(null)} />
      {section === 'agents' && (
        activeAgent ? (
          <AgentDetailView
            key={`${activeAgent.id}-${activeAgentPanel}`}
            agent={activeAgent}
            panel={activeAgentPanel}
            definitionData={definitionData}
            overview={overview}
            busy={busy}
            onBack={() => setSelectedAgent(null)}
            onOpenWorkflow={() => openEditor(activeAgent)}
            onRun={() => runAgent(activeAgent)}
            onSave={(updates) => saveAgent(activeAgent, updates)}
          />
        ) : (
          <AgentsView
            agents={agents}
            folders={folders}
            overview={overview}
            isLoading={isLoading}
            onCreate={() => {
              setCreateStep('form');
              setCreateError('');
              setDialog('agent');
            }}
            onUpload={() => setDialog('uploadAgent')}
            onCreateFolder={() => setDialog('folder')}
            onOpenEditor={(agent) => {
              setSelectedAgent(agent);
              setEditorAgent(null);
            }}
          />
        )
      )}
      {section === 'campaigns' && (
        <CampaignsView
          campaigns={rows}
          agents={agents}
          telephony={telephony}
          form={campaignForm}
          setForm={setCampaignForm}
          busy={busy}
          onCreate={createCampaign}
        />
      )}
      {section === 'models' && (
        <ModelsView
          models={rows}
          modelTab={modelTab}
          setModelTab={setModelTab}
          form={modelForm}
          setForm={setModelForm}
          busy={busy}
          onSave={createModelConfig}
        />
      )}
      {section === 'telephony' && (
        <TelephonyView
          telephony={telephony}
          onAdd={(provider) => {
            if (provider) setTelephonyForm((current) => ({ ...current, provider }));
            setDialog('telephony');
          }}
        />
      )}
      {section === 'tools' && (
        <ToolsView tools={rows} onCreate={() => setDialog('tool')} />
      )}
      {section === 'files' && (
        <FilesView files={rows} onUpload={() => setDialog('file')} />
      )}
      {section === 'recordings' && (
        <RecordingsView recordings={rows} onUpload={() => setDialog('recording')} />
      )}
      {section === 'developers' && (
        <DevelopersView data={data} />
      )}
      {section === 'runs' && (
        <RunsView runs={runs} overview={overview} />
      )}
      {section === 'reports' && (
        <ReportsView reports={reports} runs={runs} agents={agents} />
      )}

      {dialog === 'agent' && (
        <AgentCreateDialog
          step={createStep}
          error={createError}
          form={agentForm}
          setForm={setAgentForm}
          onClose={() => setDialog(null)}
          onCreate={createAgent}
          onOpen={() => {
            setDialog(null);
            if (createdAgent) openEditor(createdAgent);
          }}
        />
      )}
      {dialog === 'uploadAgent' && (
        <AgentUploadDialog
          busy={busy}
          onClose={() => setDialog(null)}
          onCreate={async (agentDefinition) => {
            setNotice(null);
            try {
              const result = await postJson('/api/voice/agents', agentDefinition);
              setNotice({ type: 'ok', message: 'Agentdefinitie geïmporteerd.' });
              setDialog(null);
              if (result.agent) openEditor(result.agent);
            } catch (error) {
              setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Agentdefinitie kon niet worden geïmporteerd.' });
            }
          }}
        />
      )}
      {dialog === 'folder' && (
        <FolderDialog
          form={folderForm}
          setForm={setFolderForm}
          onClose={() => setDialog(null)}
          onCreate={() => {
            if (!folderForm.name.trim()) return;
            setFolders((current) => [...current, { id: crypto.randomUUID(), name: folderForm.name.trim() }]);
            setNotice({ type: 'ok', message: 'Map aangemaakt.' });
            setFolderForm({ name: '' });
            setDialog(null);
          }}
        />
      )}
      {dialog === 'telephony' && (
        <TelephonyDialog
          form={telephonyForm}
          setForm={setTelephonyForm}
          busy={busy}
          onClose={() => setDialog(null)}
          onCreate={createTelephony}
        />
      )}
      {dialog === 'tool' && (
        <ToolDialog
          form={toolForm}
          setForm={setToolForm}
          busy={busy}
          onClose={() => setDialog(null)}
          onCreate={createTool}
        />
      )}
      {dialog === 'file' && (
        <FileDialog
          form={fileForm}
          setForm={setFileForm}
          busy={busy}
          onClose={() => setDialog(null)}
          onCreate={createFile}
        />
      )}
      {dialog === 'recording' && (
        <RecordingDialog
          form={recordingForm}
          setForm={setRecordingForm}
          busy={busy}
          onClose={() => setDialog(null)}
          onCreate={createRecording}
        />
      )}
    </VoiceWorkspace>
  );
}

function VoiceWorkspace({
  section,
  agents,
  selectedAgent,
  agentMenuMode = 'agent',
  agentPanel,
  onSelectAgent,
  onBackToWorkspace,
  onCreateAgent,
  onOpenWorkflow,
  children,
}: {
  section: SectionKey;
  agents: any[];
  selectedAgent: any | null;
  agentMenuMode?: 'agent' | 'workflow';
  agentPanel: AgentPanel;
  onSelectAgent: (agent: any) => void;
  onBackToWorkspace: () => void;
  onCreateAgent: () => void;
  onOpenWorkflow: (agent: any) => void;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`kyrn-voice flex h-dvh min-h-0 flex-1 overflow-hidden bg-[#f8f8f7] ${voicePageText} dark:bg-[#050505]`}>
      <VoiceSidebar
        section={section}
        agents={agents}
        selectedAgent={selectedAgent}
        agentPanel={agentPanel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        onSelectAgent={onSelectAgent}
        onBackToWorkspace={onBackToWorkspace}
        onCreateAgent={onCreateAgent}
        onOpenWorkflow={onOpenWorkflow}
        agentMenuMode={agentMenuMode}
      />
      <main className="min-w-0 flex-1 overflow-auto border-l border-zinc-200 bg-[#f8f8f7] dark:border-[#272d2a] dark:bg-[#050505]">
        {children}
      </main>
    </div>
  );
}

function VoiceSidebar({
  section,
  agents,
  selectedAgent,
  agentMenuMode,
  agentPanel,
  collapsed,
  onToggle,
  onSelectAgent,
  onBackToWorkspace,
  onCreateAgent,
  onOpenWorkflow,
}: {
  section: SectionKey;
  agents: any[];
  selectedAgent: any | null;
  agentMenuMode: 'agent' | 'workflow';
  agentPanel: AgentPanel;
  collapsed: boolean;
  onToggle: () => void;
  onSelectAgent: (agent: any) => void;
  onBackToWorkspace: () => void;
  onCreateAgent: () => void;
  onOpenWorkflow: (agent: any) => void;
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const agentList = agents.slice(0, 5);

  return (
    <aside className={`hidden h-dvh min-h-0 shrink-0 flex-col border-r border-zinc-200 bg-[#fbfbfa] ${voiceSidebarText} transition-[width] duration-200 dark:border-[#272d2a] dark:bg-[#0c0e0f] lg:flex ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}>
      <div className={`flex h-12 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-[#272d2a] ${collapsed ? 'justify-center' : 'justify-start'}`}>
        <Link href="/voice" className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Logo className="h-7" />
          {!collapsed && <span className={`text-[11px] font-medium ${voiceSidebarMuted}`}>Voice v1</span>}
        </Link>
      </div>

      {!collapsed && <div className="relative shrink-0 border-b border-zinc-200 p-3 dark:border-[#272d2a]">
        <button
          type="button"
          onClick={() => setSwitcherOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-zinc-300 hover:bg-[#0000170b] dark:border-[#303630] dark:bg-[#151816] dark:hover:bg-[#202620]"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-[#0000170b] ${voiceSidebarTextStrong} dark:bg-[#202620]`}>
            <Mic className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate font-semibold ${voiceSidebarTextStrong}`}>Spraakagents</span>
            <span className={`block truncate text-xs ${voiceSidebarMuted}`}>Bouw en monitor gesprekken</span>
          </span>
          <ChevronDown className={`h-4 w-4 ${voiceSidebarMuted} transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-[68px] z-30 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 dark:border-[#303630] dark:bg-[#151816]">
            <ProductOption href="/voice" icon={Mic} title="Spraakagents" description="Gesprekken, campagnes en opnames" active />
            <ProductOption href="/automation" icon={MessageSquare} title="WhatsApp-agents" description="Automatiseer inbox, antwoorden en flows" />
            <ProductOption href="/settings/developers" icon={Sparkles} title="Kyrn API" description="Sleutels, webhooks en integraties" />
          </div>
        )}
      </div>}

      <nav className={`min-h-0 flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${collapsed ? 'p-2 pt-3' : 'p-3'}`}>
        {selectedAgent && !collapsed ? (
          <AgentSidebarMenu agent={selectedAgent} section={section} activeMode={agentMenuMode} activePanel={agentPanel} onBack={onBackToWorkspace} onOpenWorkflow={() => onOpenWorkflow(selectedAgent)} />
        ) : (
          <>
            <Link href="/voice">
              <span title="Home" className={`mb-4 flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${section === 'agents' ? voiceSidebarItemActive : voiceSidebarItemIdle}`}>
                <Bot className="h-4 w-4" />
                {!collapsed && 'Start'}
              </span>
            </Link>

            {!collapsed && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className={`text-sm font-semibold ${voiceSidebarMuted}`}>Agents</p>
                  <button
                    type="button"
                    onClick={onCreateAgent}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-white transition hover:border-zinc-300 hover:bg-[#0000170b] ${voiceSidebarText} dark:border-[#303630] dark:bg-[#151816] dark:hover:bg-[#202620]`}
                    aria-label="Create voice agent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {agentList.length === 0 ? (
                    <button
                      type="button"
                      onClick={onCreateAgent}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${voiceSidebarItemIdle}`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-[#0000170b] ${voiceSidebarTextStrong} dark:bg-[#202620]`}>
                        <Plus className="h-3 w-3" />
                      </span>
                      Eerste agent maken
                    </button>
                  ) : agentList.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => onSelectAgent(agent)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${voiceSidebarItemIdle}`}
                    >
                      <AgentOrb name={agent.name} />
                      <span className="min-w-0 flex-1 truncate">{agent.name}</span>
                    </button>
                  ))}
                  {agents.length > agentList.length && (
                    <button type="button" className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${voiceSidebarItemIdle}`}>
                      <MoreVertical className="h-4 w-4" />
                      Meer
                    </button>
                  )}
                </div>
              </div>
            )}

            {navGroups.map((group) => (
              <div key={group.title} className="mb-7">
                {!collapsed && <p className={`mb-2 px-2 text-xs font-semibold ${voiceSidebarMuted}`}>{group.title === 'BUILD' ? 'Inrichten' : 'Monitoren'}</p>}
                <div className="space-y-1">
                  {group.items.filter((item) => item.key !== 'agents').map((item) => {
                    const Icon = item.icon;
                    const active = item.key === section;
                    return (
                      <Link key={item.key} href={item.href}>
                        <span title={item.label} className={`flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${active ? voiceSidebarItemActive : voiceSidebarItemIdle}`}>
                          <Icon className="h-4 w-4" />
                          {!collapsed && item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </nav>
      <div className={`shrink-0 border-t border-zinc-200 dark:border-[#272d2a] ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-[#303630] dark:bg-[#151816]">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0000170b] ${voiceSidebarTextStrong} dark:bg-[#202620]`}>
              <Headphones className="h-4 w-4" />
            </div>
            <p className={`text-sm font-semibold ${voiceSidebarTextStrong}`}>Test je agent</p>
            <p className={`mt-1 text-xs leading-4 ${voiceSidebarMuted}`}>Start een browsergesprek voordat je live gaat.</p>
          </div>
        )}
        <WorkspaceThemeToggle collapsed={collapsed} className={`${voiceSidebarText} hover:bg-[#0000170b] hover:text-[hsl(240_1.7%_11.2%)] dark:hover:bg-[#1b211d] dark:hover:text-white`} />
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
          aria-label={collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
          className={`mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white ${voiceSidebarText} shadow-sm transition hover:border-zinc-300 hover:bg-[#0000170b] dark:border-[#303630] dark:bg-[#151816] dark:hover:bg-[#202620] ${collapsed ? 'mx-auto' : ''}`}
        >
          <PanelLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
}

function ProductOption({
  href,
  icon: Icon,
  title,
  description,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={`flex items-center gap-3 border-b border-zinc-100 px-3 py-3 last:border-b-0 dark:border-[#272d2a] ${active ? 'bg-[#0000170b] dark:bg-[#202620]' : 'hover:bg-[#0000170b] dark:hover:bg-[#202620]'}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white ${voiceSidebarTextStrong} dark:border-[#303630] dark:bg-[#151816]`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${voiceSidebarTextStrong}`}>{title}</span>
        <span className={`block truncate text-xs ${voiceSidebarMuted}`}>{description}</span>
      </span>
    </Link>
  );
}

function AgentOrb({ name }: { name?: string }) {
  const first = (name || 'Agent').trim().charAt(0).toUpperCase();

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_150deg,#06b6d4,#22c55e,#a78bfa,#06b6d4)] text-[10px] font-bold text-white shadow-sm">
      {first}
    </span>
  );
}

function AgentSidebarMenu({
  agent,
  section,
  activeMode,
  activePanel,
  onBack,
  onOpenWorkflow,
}: {
  agent: any;
  section: SectionKey;
  activeMode: 'agent' | 'workflow';
  activePanel: AgentPanel;
  onBack: () => void;
  onOpenWorkflow: () => void;
}) {
  const agentHref = (href: string, panel?: AgentPanel | 'tests' | 'users') => {
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}agentId=${agent.id}${panel ? `&panel=${panel}` : ''}`;
  };
  const configureItems = [
    { label: 'Agent', icon: Bot, href: agentHref('/voice'), active: section === 'agents' && activeMode === 'agent' && activePanel === 'agent' },
    { label: 'Workflow', icon: GitBranch, href: agentHref('/voice', 'workflow'), active: section === 'agents' && (activeMode === 'workflow' || activePanel === 'workflow') },
    { label: 'Branches', icon: Cable, href: agentHref('/voice', 'branches'), active: section === 'agents' && activePanel === 'branches' },
    { label: 'Kennisbank', icon: Database, href: agentHref('/voice/files'), active: section === 'files' },
    { label: 'Analyse', icon: BarChart3, href: agentHref('/voice/reports'), active: section === 'reports' },
    { label: 'Tools', icon: Wrench, href: agentHref('/voice/tools'), active: section === 'tools' },
    { label: 'Widget', icon: Code2, href: agentHref('/voice', 'widget'), active: section === 'agents' && activePanel === 'widget' },
    { label: 'Instellingen', icon: Settings2, href: agentHref('/voice/models'), active: section === 'models' },
  ];
  const monitorItems = [
    { label: 'Dashboards', icon: BarChart3, href: agentHref('/voice/reports'), active: section === 'reports' },
    { label: 'Gesprekken', icon: MessageSquare, href: agentHref('/voice/runs'), active: section === 'runs' && activePanel !== 'tests' },
    { label: 'Tests', icon: ShieldCheck, href: agentHref('/voice/runs', 'tests'), active: section === 'runs' && activePanel === 'tests' },
    { label: 'Gebruikers', icon: Users, href: agentHref('/voice/developers', 'users'), active: section === 'developers' && activePanel === 'users' },
  ];
  const deployItems = [
    { label: 'Uitgaand bellen', icon: Phone, href: agentHref('/voice/campaigns'), active: section === 'campaigns' },
  ];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${voiceSidebarItemIdle}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar workspace
      </button>

      <button
        type="button"
        onClick={onOpenWorkflow}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 text-left shadow-sm transition hover:border-zinc-300 hover:bg-[#0000170b] dark:border-[#303630] dark:bg-[#151816] dark:hover:bg-[#202620]"
      >
        <AgentOrb name={agent.name} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-semibold ${voiceSidebarTextStrong}`}>{agent.name}</span>
          <span className={`block truncate text-xs ${voiceSidebarMuted}`}>{agent.status || 'actief'} workflow</span>
        </span>
      </button>

      <SidebarMenuGroup title="Inrichten" items={configureItems} />
      <SidebarMenuGroup title="Monitoren" items={monitorItems} />
      <SidebarMenuGroup title="Uitrollen" items={deployItems} />
    </div>
  );
}

function SidebarMenuGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    icon: LucideIcon;
    href: string | null;
    active?: boolean;
    onClick?: () => void;
  }>;
}) {
  return (
    <div>
      <p className={`mb-2 px-2 text-sm font-semibold ${voiceSidebarMuted}`}>{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          item.href ? (
            <Link key={item.label} href={item.href}>
              <span className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition ${item.active ? voiceSidebarItemActive : voiceSidebarItemIdle}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${item.active ? voiceSidebarItemActive : voiceSidebarItemIdle}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        ))}
      </div>
    </div>
  );
}

function AgentDetailView({
  agent,
  panel,
  definitionData,
  overview,
  busy,
  onBack,
  onOpenWorkflow,
  onRun,
  onSave,
}: {
  agent: any;
  panel: AgentPanel;
  definitionData?: any;
  overview: any;
  busy: boolean;
  onBack: () => void;
  onOpenWorkflow: () => void;
  onRun: () => void;
  onSave: (updates: Record<string, any>) => Promise<any>;
}) {
  const systemPrompt = agent.systemPrompt || buildAgentPrompt(agent.name || 'Spraakassistent', agent.description || 'Help bellers en WhatsApp-contacten duidelijk.', 'inbound');
  const firstMessage = agent.firstMessage || agent.description || 'Hey, goed dat je er bent. Vertel me waar je vandaag mee bezig bent, dan help ik je de juiste volgende stap te zetten.';
  const metadata = agent.metadata || {};
  const [draft, setDraft] = useState({
    name: agent.name || 'Kyrn Voice Agent',
    description: agent.description || '',
    systemPrompt,
    firstMessage,
    defaultLanguage: agent.defaultLanguage || 'nl',
    channelMode: agent.channelMode || 'whatsapp_voice',
    voice: metadata.voice || 'Kyrn warm voice',
    llmModel: metadata.llmModel || 'gpt-4o-mini',
    behavior: metadata.behavior || 'Standaardgedrag',
  });
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [previewMessages, setPreviewMessages] = useState<Array<{ role: 'agent' | 'user'; content: string }>>([
    { role: 'agent', content: firstMessage },
  ]);
  const latestDefinition = definitionData?.definition;
  const headerPanelLabel = panel === 'branches'
    ? 'Branches'
    : panel === 'widget'
      ? 'Widget'
      : 'Main';
  const headerStatusLabel = latestDefinition?.status === 'draft'
    ? 'Draft klaar'
    : agent.isActive || agent.status === 'active'
      ? 'Live'
      : agent.status || 'Draft';

  const updateDraft = (updates: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setDirty(true);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      await onSave({
        name: draft.name.trim() || agent.name,
        description: draft.description,
        systemPrompt: draft.systemPrompt,
        firstMessage: draft.firstMessage,
        defaultLanguage: draft.defaultLanguage,
        channelMode: draft.channelMode,
        status: agent.status || 'active',
        isActive: agent.isActive ?? true,
        metadata: {
          ...metadata,
          voice: draft.voice,
          llmModel: draft.llmModel,
          behavior: draft.behavior,
        },
      });
      setDirty(false);
      setSaveSuccess('Agent opgeslagen. De nieuwe configuratie is nu actief.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Agent kon niet worden opgeslagen.');
      setSaveSuccess('');
    }
  };

  const sendPreviewMessage = () => {
    const message = chatInput.trim();
    if (!message) return;
    const reply = draft.firstMessage
      ? `${draft.name}: ${draft.firstMessage}`
      : `${draft.name}: Ik heb je bericht ontvangen. Ik gebruik nu je opgeslagen prompt en instellingen voor deze test.`;
    setPreviewMessages((current) => [
      ...current,
      { role: 'user', content: message },
      { role: 'agent', content: reply },
    ]);
    setChatInput('');
  };

  return (
    <div className={`min-h-full bg-[#fbfbfa] ${voicePageText} dark:bg-[#050505]`}>
      <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-[#272d2a] dark:bg-[#0c0e0f]">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <button type="button" onClick={onBack} className={`mr-2 rounded-md p-1 text-zinc-500 transition ${voiceHoverSurface} hover:text-[hsl(240_1.7%_11.2%)] dark:hover:text-white`}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="truncate font-semibold">{agent.name}</span>
          <span className={voicePageMuted}>/</span>
          <span>{headerPanelLabel}</span>
          <Badge className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{headerStatusLabel}</Badge>
                  {dirty && <Badge className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950/70 dark:text-amber-200">Niet-opgeslagen wijzigingen</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <VoiceButton variant="light">Publiek</VoiceButton>
          <VoiceButton variant="light"><Code2 className="h-4 w-4" /> Variabelen</VoiceButton>
          <VoiceButton variant="light">Voorbeeld</VoiceButton>
          <VoiceButton variant="light" onClick={onOpenWorkflow}>Workflow</VoiceButton>
          <VoiceButton onClick={handleSave} disabled={!dirty || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Agent opslaan
          </VoiceButton>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-44px)] grid-cols-[minmax(0,1fr)_430px]">
        <section className="overflow-auto px-8 py-10">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Agent</h1>
                  <Badge className="rounded-full bg-zinc-950 text-white">Nieuw</Badge>
                  <span className={`rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm ${voicePageMuted} dark:border-[#303030] dark:bg-[#171717]`}>Nieuwe functies bekijken</span>
                </div>
                <p className={`mt-2 max-w-2xl text-sm ${voicePageMuted}`}>Eén gedeeld brein voor browsergesprekken, inkomende telefoongesprekken en WhatsApp-automatisering.</p>
                {saveError && <p className="mt-2 text-sm font-semibold text-red-500">{saveError}</p>}
                {saveSuccess && <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{saveSuccess}</p>}
              </div>
              <CreditPill credits={overview?.credits} />
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              {panel === 'branches' ? (
                <AgentBranchesPanel agent={agent} definitionData={definitionData} onOpenWorkflow={onOpenWorkflow} onRun={onRun} />
              ) : panel === 'widget' ? (
                <AgentWidgetPanel agent={agent} onRun={onRun} />
              ) : (
                <>
                  <div className="space-y-7">
                    <div className={`rounded-xl p-5 ${voicePanelClass}`}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <VoiceField label="Agentnaam">
                          <Input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className={inputClass} />
                        </VoiceField>
                        <VoiceField label="Kanaal">
                          <NativeSelect value={draft.channelMode} onChange={(value) => updateDraft({ channelMode: value })}>
                            <option value="whatsapp_voice">WhatsApp + spraak</option>
                            <option value="voice_only">Alleen spraak</option>
                            <option value="whatsapp_only">Alleen WhatsApp</option>
                          </NativeSelect>
                        </VoiceField>
                      </div>
                      <VoiceField label="Beschrijving" className="mt-4">
                        <Textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} rows={3} className={inputClass} />
                      </VoiceField>
                    </div>
                    <AgentTextPanel title="Systeemprompt" value={draft.systemPrompt} rows={14} onChange={(value) => updateDraft({ systemPrompt: value })} />
                    <AgentTextPanel title="Eerste bericht" value={draft.firstMessage} rows={5} footer="Onderbreekbaar" onChange={(value) => updateDraft({ firstMessage: value })} />
                  </div>

                  <div className="space-y-5">
                    <AgentSettingSelect
                      title="Stemmen"
                      description="Selecteer welke stemmen deze agent mag gebruiken."
                      value={draft.voice}
                      onChange={(value) => updateDraft({ voice: value })}
                      options={[
                        { value: 'Kyrn warm voice', label: 'Kyrn warme stem - primair' },
                        { value: 'Kyrn clear voice', label: 'Kyrn heldere stem' },
                        { value: 'Kyrn energetic voice', label: 'Kyrn energieke stem' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="Taal"
                      description="Standaardtaal en extra talen."
                      value={draft.defaultLanguage}
                      onChange={(value) => updateDraft({ defaultLanguage: value })}
                      options={[
                        { value: 'nl', label: 'Nederlands - standaard' },
                        { value: 'en', label: 'Engels' },
                        { value: 'de', label: 'Duits' },
                        { value: 'es', label: 'Spaans' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="LLM"
                      description="Provider en model voor deze agent."
                      value={draft.llmModel}
                      onChange={(value) => updateDraft({ llmModel: value })}
                      options={[
                        { value: 'gemini-3.1-flash-live-preview', label: 'Gemini 3.1 Flash Live' },
                        { value: 'gemini-3.1-flash', label: 'Gemini 3.1 Flash' },
                        { value: 'gpt-4o', label: 'OpenAI gpt-4o' },
                        { value: 'qwen3-30b-a3b', label: 'Qwen3-30B-A3B' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="Agentgedrag"
                      description="Persoonlijkheid en antwoordgedrag per kanaal."
                      value={draft.behavior}
                      onChange={(value) => updateDraft({ behavior: value })}
                      options={[
                        { value: 'Standaardgedrag', label: 'Standaardgedrag' },
                        { value: 'Kort en direct', label: 'Kort en direct' },
                        { value: 'Warme salesassistent', label: 'Warme salesassistent' },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="relative border-l border-zinc-200 bg-white dark:border-[#272d2a] dark:bg-[#0c0e0f]">
          <div className="flex h-11 items-center justify-between border-b border-zinc-200 px-4 dark:border-[#272d2a]">
            <div className="rounded-lg bg-zinc-100 p-1 text-sm font-medium dark:bg-[#181818]">
              <button className="rounded-md bg-white px-3 py-1 shadow-sm dark:bg-[#050505]">Inline</button>
              <button className={`px-3 py-1 ${voicePageMuted}`}>Widget</button>
            </div>
            <div className={`flex items-center gap-3 text-sm font-medium ${voicePageText}`}>
              <Wrench className="h-4 w-4" />
              Mocktools
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-[#181818]">Off</span>
            </div>
          </div>
          <div className="flex h-[calc(100%-44px)] flex-col items-center justify-center bg-[repeating-linear-gradient(135deg,#fff,#fff_12px,#fafafa_12px,#fafafa_24px)] px-6 dark:bg-[repeating-linear-gradient(135deg,#070707,#070707_12px,#0d0d0d_12px,#0d0d0d_24px)]">
            <div className="relative h-72 w-72 rounded-full bg-[conic-gradient(from_35deg,#0047ab,#5eead4,#e0ffff,#0066cc,#67e8f9,#0047ab)] shadow-2xl shadow-cyan-500/20">
              <div className="absolute inset-10 rounded-full bg-white/10 blur-sm" />
              <button
                type="button"
                onClick={onRun}
                className="absolute -bottom-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xl transition hover:scale-105"
                aria-label="Spraaktest uitvoeren"
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
            <div className={`absolute bottom-6 left-6 right-6 rounded-3xl p-5 shadow-xl ${voicePanelClass}`}>
              <div className="mb-4 max-h-44 space-y-3 overflow-auto pr-1">
                {previewMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-4 py-3 text-sm leading-5 ${
                      message.role === 'agent'
                        ? 'bg-cyan-50 text-cyan-950 dark:bg-cyan-500/10 dark:text-cyan-100'
                        : 'ml-8 bg-zinc-100 text-zinc-950 dark:bg-[#242424] dark:text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendPreviewMessage();
                  }}
                  placeholder="Stuur een bericht om een chat te starten"
                  className={inputClass}
                />
                <button type="button" onClick={sendPreviewMessage} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Play className="h-5 w-5 fill-current" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className={`flex gap-4 ${voicePageText}`}>
                  <Settings2 className="h-5 w-5" />
                  <Mic className="h-5 w-5" />
                </div>
                <VoiceButton variant="light" onClick={onRun}><Phone className="h-4 w-4" /> Testgesprek</VoiceButton>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AgentTextPanel({ title, value, rows, footer, onChange }: { title: string; value: string; rows: number; footer?: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="underline decoration-dotted underline-offset-4">{title}</span>
        <FileText className="h-4 w-4 text-zinc-400" />
      </div>
      <div className={`overflow-hidden rounded-xl ${voicePanelClass}`}>
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="min-h-0 resize-none border-0 bg-white text-base leading-6 text-[hsl(240_1.7%_11.2%)] shadow-none focus-visible:ring-0 dark:bg-[#171717] dark:text-white" />
        <div className={`flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm ${voicePageMuted} dark:border-[#303030] dark:bg-[#101010]`}>
          <span>Typ {'{{'} om variabelen toe te voegen</span>
          {footer && <span className={`flex items-center gap-2 ${voicePageText}`}><Toggle checked onChange={() => {}} /> {footer}</span>}
        </div>
      </div>
    </div>
  );
}

function AgentBranchesPanel({
  agent,
  definitionData,
  onOpenWorkflow,
  onRun,
}: {
  agent: any;
  definitionData?: any;
  onOpenWorkflow: () => void;
  onRun: () => void;
}) {
  const definitions = (definitionData?.definitions || (definitionData?.definition ? [definitionData.definition] : [])) as any[];
  const latestDefinition = definitionData?.definition || definitions[0];
  const publishedDefinition = definitions.find((definition) => definition.status === 'published') || latestDefinition;
  const draftDefinition = definitions.find((definition) => definition.status === 'draft');
  const [activeBranch, setActiveBranch] = useState<'main' | 'draft' | 'experiment'>('main');
  const [experimentCreated, setExperimentCreated] = useState(false);

  const branchCards = [
    {
      id: 'main' as const,
      name: 'Main',
      status: publishedDefinition?.status === 'published' ? `Live v${publishedDefinition.version}` : 'Geen live versie',
      description: publishedDefinition
        ? 'Gepubliceerde branch voor browsertests, telefoongesprekken en WhatsApp-overdracht.'
        : 'Publiceer een workflow voordat live verkeer deze branch kan gebruiken.',
      meta: publishedDefinition ? `${countNodes(publishedDefinition)} nodes` : 'Geen definitie',
      action: 'Open live workflow',
      onClick: () => {
        setActiveBranch('main');
        onOpenWorkflow();
      },
    },
    {
      id: 'draft' as const,
      name: 'Draft',
      status: draftDefinition ? `Draft v${draftDefinition.version}` : 'Nog geen draft',
      description: draftDefinition
        ? 'Werkruimte voor prompt- en workflowwijzigingen voordat je publiceert.'
        : 'Open de workflow-editor en sla een keer op om een draftbranch te maken.',
      meta: draftDefinition ? `${countNodes(draftDefinition)} nodes` : 'Maak vanuit workflow',
      action: draftDefinition ? 'Open draft' : 'Start draft',
      onClick: () => {
        setActiveBranch('draft');
        onOpenWorkflow();
      },
    },
    {
      id: 'experiment' as const,
      name: 'Experiment',
      status: experimentCreated ? 'Klaar in sessie' : 'Niet aangemaakt',
      description: experimentCreated
        ? 'Tijdelijke branch om een andere begroeting, taal of gespreksdoel te testen.'
        : 'Maak in deze sessie een tijdelijke experimentbranch vanuit de laatste workflow.',
      meta: latestDefinition ? `Basis v${latestDefinition.version}` : 'Geen basisworkflow',
      action: experimentCreated ? 'Experiment bekijken' : 'Experiment maken',
      onClick: () => {
        setExperimentCreated(true);
        setActiveBranch('experiment');
      },
    },
  ];

  const activeCard = branchCards.find((branch) => branch.id === activeBranch) || branchCards[0];

  return (
    <div className="space-y-5 xl:col-span-2">
      <Panel title="Branches" subtitle={`Versies en publicatiebranches voor ${agent.name}.`}>
        <div className="grid gap-4 md:grid-cols-3">
          {branchCards.map((branch) => (
            <div
              key={branch.name}
              className={`rounded-xl p-4 transition ${voiceSoftPanelClass} ${activeBranch === branch.id ? 'ring-2 ring-cyan-500' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">{branch.name}</h2>
                <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">{branch.status}</Badge>
              </div>
              <p className={`mt-4 text-sm leading-6 ${voicePageMuted}`}>{branch.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{branch.meta}</p>
              <VoiceButton variant="light" onClick={branch.onClick} className="mt-5 w-full justify-center">{branch.action}</VoiceButton>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`${activeCard.name} branch`} subtitle="Live branchdetails worden bijgewerkt zodra je een branch kiest.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">{activeCard.status}</Badge>
              <span className={`text-sm ${voicePageMuted}`}>{activeCard.meta}</span>
            </div>
            <p className={`mt-3 text-sm leading-6 ${voicePageMuted}`}>{activeCard.description}</p>
            {activeBranch === 'experiment' && (
              <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                Dit experiment is tijdelijk. Open de workflow-editor en sla op/publiceer wanneer je er een echte draft of live versie van wilt maken.
              </p>
            )}
          </div>
          <div className="grid gap-3">
            <VoiceButton onClick={activeBranch === 'experiment' ? onRun : onOpenWorkflow} className="justify-center">
              {activeBranch === 'experiment' ? <Phone className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
              {activeBranch === 'experiment' ? 'Testgesprek bekijken' : 'Workflow openen'}
            </VoiceButton>
            <VoiceButton variant="ghost" onClick={onRun} className="justify-center">
              <Play className="h-4 w-4" /> Branch testen
            </VoiceButton>
          </div>
        </div>
      </Panel>

      <Panel title="Publicatiegeschiedenis" subtitle="Recente versies voor deze agent.">
        <div className="divide-y divide-zinc-200 dark:divide-[#303030]">
          {definitions.length ? definitions.map((definition) => (
            <div key={definition.id || definition.version} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium">v{definition.version} {formatDefinitionStatus(definition.status)}</span>
              <span className={voicePageMuted}>{formatVoiceDate(definition.publishedAt || definition.createdAt)}</span>
            </div>
          )) : (
            <div className={`py-3 text-sm ${voicePageMuted}`}>Er zijn nog geen versies opgeslagen.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function countNodes(definition: any) {
  return Array.isArray(definition?.nodes) ? definition.nodes.length : 0;
}

function formatDefinitionStatus(status: string | null | undefined) {
  if (!status) return 'Opgeslagen';
  if (status === 'published') return 'Gepubliceerd';
  if (status === 'draft') return 'Draft';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatVoiceDate(value: string | Date | null | undefined) {
  if (!value) return 'Niet gepubliceerd';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Niet gepubliceerd';
  return new Intl.DateTimeFormat('nl-NL', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function AgentWidgetPanel({ agent, onRun }: { agent: any; onRun: () => void }) {
  const [copied, setCopied] = useState(false);
  const [widgetMode, setWidgetMode] = useState<'inline' | 'floating'>('inline');
  const [settings, setSettings] = useState({
    chatTextOnly: true,
    sendTextWhileOnCall: true,
    realtimeTranscript: true,
    feedbackCollection: false,
  });
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewMessages, setPreviewMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([
    {
      role: 'agent',
      content: agent.firstMessage || 'Hoi, ik ben je Kyrn agent. Waar kan ik je mee helpen?',
    },
  ]);
  const embedHost = typeof window !== 'undefined' ? window.location.origin : 'https://kyrn.nl';
  const embedCode = `<script src="${embedHost}/widget.js" data-agent-id="${agent.id}" data-mode="${widgetMode}" async></script>`;
  const enabledCount = Object.values(settings).filter(Boolean).length;

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const sendPreviewMessage = () => {
    const message = previewMessage.trim();
    if (!message) return;
    setPreviewMessages((current) => [
      ...current,
      { role: 'user', content: message },
      {
        role: 'agent',
        content: `${agent.name}: Ik heb je bericht ontvangen. Deze preview gebruikt de widget-instellingen en agentprompt.`,
      },
    ]);
    setPreviewMessage('');
  };

  return (
    <div className="space-y-5 xl:col-span-2">
      <Panel title="Widget" subtitle="Configureer de inline chat- en belwidget voor deze spraakagent.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5 min-w-0">
            <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Installatie</p>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>Plaats deze snippet op de pagina waar de agent zichtbaar moet zijn.</p>
                </div>
                <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  {enabledCount} opties actief
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Input value={embedCode} readOnly className={`${inputClass} min-w-0 font-mono text-xs`} />
                <VoiceButton variant="ghost" onClick={copyEmbedCode} className="shrink-0">
                  <FileText className="h-4 w-4" /> {copied ? 'Gekopieerd' : 'Kopieer'}
                </VoiceButton>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
              <p className="text-sm font-bold">Weergave</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { value: 'inline', label: 'Inline' },
                  { value: 'floating', label: 'Zwevend' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setWidgetMode(mode.value as 'inline' | 'floating')}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      widgetMode === mode.value
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-100'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-200 dark:hover:bg-[#202020]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['chatTextOnly', 'Alleen tekstchat', 'Sta bezoekers toe eerst via tekst te starten.'],
                ['sendTextWhileOnCall', 'Tekst tijdens gesprek', 'Laat bezoekers tekst sturen tijdens een lopende call.'],
                ['realtimeTranscript', 'Realtime transcript', 'Toon transcript terwijl het gesprek loopt.'],
                ['feedbackCollection', 'Feedback verzamelen', 'Vraag feedback na afloop van het gesprek.'],
              ].map(([key, label, description]) => (
                <div key={key} className={`flex items-center justify-between gap-4 rounded-lg p-3 ${voiceSoftPanelClass}`}>
                  <div>
                    <span className="text-sm font-semibold">{label}</span>
                    <p className={`mt-1 text-xs ${voicePageMuted}`}>{description}</p>
                  </div>
                  <Toggle
                    checked={settings[key as keyof typeof settings]}
                    onChange={() => setSettings((current) => ({ ...current, [key]: !current[key as keyof typeof settings] }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-5 ${voicePanelClass}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Live voorbeeld</p>
                <p className={`text-xs ${voicePageMuted}`}>{widgetMode === 'inline' ? 'Ingesloten op pagina' : 'Zwevende launcher'}</p>
              </div>
              <VoiceButton variant="light" onClick={onRun}>
                <Phone className="h-4 w-4" /> Testgesprek
              </VoiceButton>
            </div>
            <div className="mx-auto mt-6 h-44 w-44 rounded-full bg-[conic-gradient(from_35deg,#0047ab,#5eead4,#e0ffff,#0066cc,#67e8f9,#0047ab)] shadow-xl shadow-cyan-500/20" />
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[#303030] dark:bg-[#101010]">
              <div className="max-h-48 space-y-3 overflow-auto pr-1">
                {previewMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-3 py-2 text-sm leading-5 ${
                      message.role === 'agent'
                        ? 'bg-cyan-50 text-cyan-950 dark:bg-cyan-500/10 dark:text-cyan-100'
                        : 'ml-8 bg-zinc-100 text-zinc-950 dark:bg-[#242424] dark:text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Input
                  value={previewMessage}
                  onChange={(event) => setPreviewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendPreviewMessage();
                  }}
                  placeholder="Stuur een bericht om een chat te starten"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={sendPreviewMessage}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  aria-label="Voorbeeldbericht versturen"
                >
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className={`mt-4 flex flex-wrap gap-2 text-xs ${voicePageMuted}`}>
                <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-[#181818]">{settings.chatTextOnly ? 'Tekst aan' : 'Spraak eerst'}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-[#181818]">{settings.realtimeTranscript ? 'Transcript aan' : 'Transcript uit'}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-[#181818]">{settings.feedbackCollection ? 'Feedback aan' : 'Feedback uit'}</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AgentSettingSelect({
  title,
  description,
  value,
  options,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-semibold">{title}</h2>
        <p className={`text-sm leading-5 ${voicePageMuted}`}>{description}</p>
      </div>
      <div className={`rounded-xl p-3 ${voicePanelClass}`}>
        <NativeSelect value={value} onChange={onChange} className="w-full">
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

function AgentsView({
  agents,
  folders,
  overview,
  isLoading,
  onCreate,
  onUpload,
  onCreateFolder,
  onOpenEditor,
}: {
  agents: any[];
  folders: Array<{ id: string; name: string }>;
  overview: any;
  isLoading: boolean;
  onCreate: () => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  onOpenEditor: (agent: any) => void;
}) {
  return (
    <div className="min-h-full">
      <PageTopbar
        actions={(
          <>
            <VoiceButton variant="ghost" onClick={onUpload}><Upload className="h-4 w-4" /> Agentdefinitie uploaden</VoiceButton>
            <VoiceButton variant="ghost" onClick={onCreateFolder}><FolderPlus className="h-4 w-4" /> Nieuwe map</VoiceButton>
            <VoiceButton onClick={onCreate}><Plus className="h-4 w-4" /> Agent maken</VoiceButton>
          </>
        )}
      />
      <section className="mx-auto max-w-[1505px] px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Je agents</h1>
            <p className="mt-7 text-xl font-semibold">Actieve agents</p>
          </div>
          <CreditPill credits={overview?.credits} />
        </div>
        {folders.length > 0 && (
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            {folders.map((folder) => (
              <div key={folder.id} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${voicePanelClass}`}>
                <FolderPlus className={`h-4 w-4 ${voicePageMuted}`} />
                <span className="text-sm font-semibold">{folder.name}</span>
              </div>
            ))}
          </div>
        )}
        {agents.length === 0 ? (
          <div className={`flex min-h-[88px] items-center justify-center rounded-lg px-6 text-sm ${voiceSoftPanelClass} ${voicePageMuted}`}>
            {isLoading ? 'Agents laden...' : 'Geen actieve workflows gevonden. Maak je eerste workflow om te starten.'}
          </div>
        ) : (
          <div className="grid gap-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onOpenEditor(agent)}
                className={`group flex items-center justify-between rounded-lg px-5 py-4 text-left transition hover:border-cyan-500/60 ${voicePanelClass}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0000170b] text-[hsl(240_1.7%_11.2%)] dark:bg-cyan-500/15 dark:text-cyan-300">
                      <GitBranch className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className={`font-semibold ${voicePageText}`}>{agent.name}</h2>
                      <p className={`line-clamp-1 text-sm ${voicePageMuted}`}>{agent.description || agent.systemPrompt || 'Gedeelde WhatsApp- en spraakworkflow'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {agent.isDefaultForWhatsapp && <Badge className="bg-emerald-500/15 text-emerald-300">WhatsApp standaard</Badge>}
                  <Badge variant="outline" className="border-zinc-200 text-zinc-700 dark:border-[#343434] dark:text-zinc-300">{agent.status || 'active'}</Badge>
                  <Play className="h-4 w-4 text-zinc-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CampaignsView({
  campaigns,
  agents,
  telephony,
  form,
  setForm,
  busy,
  onCreate,
}: {
  campaigns: any[];
  agents: any[];
  telephony: any[];
  form: any;
  setForm: (next: any) => void;
  busy: boolean;
  onCreate: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'generate' | 'template' | 'blank'>('generate');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewState, setPreviewState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | number>(campaigns[0]?.id || 'draft');
  const [campaignActionBusy, setCampaignActionBusy] = useState<string | number | null>(null);
  const [campaignActionStatus, setCampaignActionStatus] = useState('');
  const templates = campaignTemplates();
  const activeAgent = agents.find((agent) => String(agent.id) === String(form.agentId)) || agents[0];
  const activeTelephony = telephony.find((config) => String(config.id) === String(form.telephonyConfigId)) || telephony[0];
  const selectedCampaign = campaigns.find((campaign) => String(campaign.id) === String(selectedCampaignId)) || campaigns[0];
  const leadCount = form.leadRows?.length || 0;
  const queueProgress = previewState === 'running' ? Math.min(72, Math.max(18, leadCount ? 28 + leadCount * 9 : 18)) : previewState === 'paused' ? 42 : 0;
  const queueStats = {
    queued: leadCount,
    active: previewState === 'running' ? Math.min(Number(form.maxConcurrency || 1), Math.max(1, leadCount)) : 0,
    completed: previewState === 'idle' ? 0 : Math.floor(leadCount / 3),
  };
  const canCreateCampaign = Boolean(form.name.trim() && (form.agentId || agents[0]?.id));

  async function runCampaignAction(campaign: any, action: 'start' | 'pause' | 'resume') {
    if (!campaign?.id) return;
    setCampaignActionBusy(campaign.id);
    setCampaignActionStatus('');
    try {
      const response = await fetch(`/api/voice/campaigns/${campaign.id}/${action}`, { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Campagne kon niet worden bijgewerkt`);
      await mutate('/api/voice/campaigns');
      await mutate('/api/voice/overview');
      setCampaignActionStatus(`${campaign.name} ${action === 'start' ? 'gestart' : action === 'pause' ? 'gepauzeerd' : 'hervat'}.`);
    } catch (error) {
      setCampaignActionStatus(error instanceof Error ? error.message : 'Campagneactie mislukt.');
    } finally {
      setCampaignActionBusy(null);
    }
  }

  function nextCampaignAction(campaign: any): 'start' | 'pause' | 'resume' {
    if (campaign?.status === 'running') return 'pause';
    if (campaign?.status === 'paused') return 'resume';
    return 'start';
  }

  async function handleCsvFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    const leadRows = parseCsvRows(text);
    setForm({
      ...form,
      sourceType: 'csv',
      leadRows,
      leadFileName: file.name,
    });
  }

  function generateCampaignSetup() {
    const prompt = String(form.aiPrompt || '').trim();
    if (!prompt) return;
    const lower = prompt.toLowerCase();
    const name = lower.includes('demo')
      ? 'AI gegenereerde demo-opvolging'
      : lower.includes('reactivation')
        ? 'AI gegenereerde heractivatiecampagne'
        : 'AI gegenereerde voicecampagne';
    setForm({
      ...form,
      name: form.name || name,
      sourceType: form.sourceType || 'csv',
      maxConcurrency: lower.includes('slow') ? 2 : 5,
    });
    setAdvancedOpen(true);
    setPreviewState('paused');
  }

  function applyTemplate(template: ReturnType<typeof campaignTemplates>[number]) {
    setMode('template');
    setForm({
      ...form,
      selectedTemplate: template.id,
      name: form.name || template.name,
      maxConcurrency: template.concurrency,
      sourceType: 'csv',
    });
    setPreviewState('paused');
  }

  function loadManualLeads() {
    const leadRows = parseManualLeadRows(form.manualLeadText || '');
    setForm({
      ...form,
      sourceType: 'manual',
      leadRows,
      leadFileName: leadRows.length ? 'Handmatige leadlijst' : '',
    });
    if (leadRows.length) setPreviewState('paused');
  }

  function selectContactSegment(segment: string) {
    const sampleRows = [
      { phone_number: '+31600000001', first_name: 'Sophie', segment, context: 'Vroeg om terugbelverzoek' },
      { phone_number: '+31600000002', first_name: 'Daan', segment, context: 'Geinteresseerd in demo' },
      { phone_number: '+31600000003', first_name: 'Mila', segment, context: 'Heeft prijsopvolging nodig' },
    ];
    setForm({
      ...form,
      sourceType: 'contacts',
      contactSegment: segment,
      leadRows: sampleRows,
      leadFileName: `${segment} contacten`,
    });
    setPreviewState('paused');
  }

  function loadSampleLeads() {
    const sampleRows = [
      { phone_number: '+31600000011', first_name: 'Nora', company: 'Studio North', context: 'Vroeg om een productdemo' },
      { phone_number: '+31600000012', first_name: 'Mats', company: 'Peak Sales', context: 'Heeft prijzen nodig voor vrijdag' },
      { phone_number: '+31600000013', first_name: 'Lina', company: 'Bright Ops', context: 'Wil WhatsApp en voice samen' },
      { phone_number: '+31600000014', first_name: 'Omar', company: 'Scale Desk', context: 'Laatste terugbelverzoek gemist' },
    ];
    setForm({
      ...form,
      sourceType: 'csv',
      leadRows: sampleRows,
      leadFileName: 'Voorbeeld campagnelijsten.csv',
    });
    setPreviewState('paused');
  }

  return (
    <SectionPage
      title="Campagnes"
      description="Maak uitgaande belcampagnes met een gekozen agent, leadbron, retryregels en live wachtrijmonitoring."
      action={<VoiceButton aria-label="Campagne aanmaken vanuit header" onClick={onCreate} disabled={busy || !canCreateCampaign}><Plus className="h-4 w-4" /> Campagne maken</VoiceButton>}
    >
      <div className={`rounded-[22px] p-5 ${voicePanelClass}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(240_1.7%_11.2%)] text-white dark:bg-white dark:text-zinc-950">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold">Campagnecentrum</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Genereer de opzet, voeg leads toe, bekijk de wachtrij en start vanuit één workspace.</p>
              </div>
            </div>
            <div className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-[#f8f8f7] px-4 py-3 dark:border-[#303030] dark:bg-[#101010]">
              <MessageSquare className={`h-5 w-5 shrink-0 ${voicePageMuted}`} />
              <input
                value={form.aiPrompt}
                onChange={(event) => setForm({ ...form, aiPrompt: event.target.value })}
                placeholder="Beschrijf een campagne: bel warme demoleads, kwalificeer budget, plan afspraken..."
                aria-label="Prompt voor campagnegeneratie"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={loadSampleLeads}
                aria-label="Voorbeeldleads aan campagne toevoegen"
                className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-[hsl(240_1.7%_11.2%)] transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424] md:inline-flex"
              >
                Voorbeeld toevoegen
              </button>
              <button
                type="button"
                onClick={generateCampaignSetup}
                disabled={!String(form.aiPrompt || '').trim()}
                aria-label="Campagne-opzet genereren vanuit prompt"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[hsl(240_1.7%_11.2%)] px-4 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                <Sparkles className="h-4 w-4" />
                Genereer
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:w-[420px]">
            {[
              ['Agent', activeAgent?.name || 'Kies agent'],
              ['Leads', `${leadCount} klaar`],
              ['Gelijktijdig', `${form.maxConcurrency || 1} gesprekken`],
            ].map(([label, value]) => (
              <div key={label} className={`rounded-2xl px-4 py-3 ${voiceSoftPanelClass}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${voicePageMuted}`}>{label}</p>
                <p className="mt-2 truncate text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <div className="space-y-6">
          <div className={`rounded-2xl p-2 ${voicePanelClass}`}>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { key: 'generate', title: 'Genereer met AI', text: 'Beschrijf een campagne en laat Kyrn de opzet maken.', icon: Sparkles },
                { key: 'template', title: 'Gebruik sjabloon', text: 'Start vanuit een bewezen outbound patroon.', icon: FileText },
                { key: 'blank', title: 'Lege campagne', text: 'Bouw elke instelling handmatig.', icon: Pencil },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMode(item.key as typeof mode)}
                    className={`rounded-xl p-4 text-left transition ${mode === item.key ? 'bg-[hsl(240_1.7%_11.2%)] text-white shadow-sm dark:bg-white dark:text-zinc-950' : `${voiceHoverSurface}`}`}
                  >
                    <Icon className="mb-4 h-5 w-5" />
                    <p className="font-semibold">{item.title}</p>
                    <p className={`mt-2 text-sm leading-5 ${mode === item.key ? 'text-white/70 dark:text-zinc-600' : voicePageMuted}`}>{item.text}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'generate' && (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Campagne-opzet genereren</h2>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>Beschrijf doel, doelgroep en toon. Kyrn vult de eerste opzet in.</p>
                </div>
                <Sparkles className="h-5 w-5 text-cyan-500" />
              </div>
              <Textarea
                value={form.aiPrompt}
                onChange={(event) => setForm({ ...form, aiPrompt: event.target.value })}
                rows={4}
                placeholder="Voorbeeld: bel warme demoleads van vorige week, kwalificeer timing en plan een afspraak als ze klaar zijn."
                className={`${inputClass} mt-5`}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-sm ${voicePageMuted}`}>Dit blijft na generatie aanpasbaar.</p>
                <VoiceButton variant="ghost" onClick={generateCampaignSetup} disabled={!String(form.aiPrompt || '').trim()}>
                  <Sparkles className="h-4 w-4" /> Opzet genereren
                </VoiceButton>
              </div>
            </div>
          )}

          {mode === 'template' && (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Campagnesjablonen</h2>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>Start met een herbruikbaar uitgaand patroon.</p>
                </div>
                <FileText className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className={`rounded-xl border p-4 text-left transition ${form.selectedTemplate === template.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-200 bg-white hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]'}`}
                  >
                    <p className="font-semibold">{template.name}</p>
                    <p className={`mt-2 text-sm leading-5 ${voicePageMuted}`}>{template.description}</p>
                    <p className="mt-4 text-xs font-semibold text-cyan-600 dark:text-cyan-300">{template.concurrency} gelijktijdige gesprekken</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Campagne-instellingen</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Geef de campagne een naam, kies de agent en voeg leads toe.</p>
              </div>
              <Badge className={`${previewState === 'running' ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'}`}>
                {previewState === 'running' ? 'Preview draait' : 'Concept'}
              </Badge>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <VoiceField label="Campagnenaam" help="Wordt getoond in rapporten, runs en leadwachtrijen.">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="bijv. demo-opvolging juni" className={inputClass} />
              </VoiceField>
              <VoiceField label="Spraakagent" help="De workflow die voor elk gesprek wordt gebruikt.">
                <NativeSelect value={form.agentId} onChange={(value) => setForm({ ...form, agentId: value })} className="w-full">
                  <option value="">Kies een agent</option>
                  {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                </NativeSelect>
              </VoiceField>
              <VoiceField label="Telefonie" help="Caller ID en outbound provider.">
                {telephony.length === 0 ? (
                  <div className={`rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm dark:border-[#333] ${voicePageMuted}`}>
                    Nog geen telefonieconfiguratie. Voeg er een toe bij Telefonie om te kunnen bellen.
                  </div>
                ) : (
                  <NativeSelect value={form.telephonyConfigId} onChange={(value) => setForm({ ...form, telephonyConfigId: value })} className="w-full">
                    <option value="">Standaard telefonieconfiguratie</option>
                    {telephony.map((config) => <option key={config.id} value={config.id}>{config.name}</option>)}
                  </NativeSelect>
                )}
              </VoiceField>
              <VoiceField label="Leadbron" help="CSV is nu actief; contacten en handmatige lijsten staan klaar.">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['csv', 'CSV'],
                    ['manual', 'Handmatig'],
                    ['contacts', 'Contacten'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, sourceType: value })}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${form.sourceType === value ? 'border-[hsl(240_1.7%_11.2%)] bg-[hsl(240_1.7%_11.2%)] text-white dark:border-white dark:bg-white dark:text-zinc-950' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-zinc-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </VoiceField>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Leadbron</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Laad de mensen die deze campagne moet bellen.</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => handleCsvFile(event.target.files?.[0])} />
              {form.sourceType === 'csv' && <VoiceButton variant="ghost" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> CSV uploaden</VoiceButton>}
            </div>
            <div className={`mt-5 rounded-xl p-5 ${voiceSoftPanelClass}`}>
              {form.sourceType === 'manual' ? (
                <div>
                  <Textarea
                    value={form.manualLeadText}
                    onChange={(event) => setForm({ ...form, manualLeadText: event.target.value })}
                    rows={6}
                    placeholder="+31600000001, Sophie, Demo aangevraagd&#10;+31600000002, Daan, Vroeg naar prijzen"
                    className={inputClass}
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-sm ${voicePageMuted}`}>Eén lead per regel: telefoon, naam, context.</p>
                    <VoiceButton variant="ghost" onClick={loadManualLeads}>Handmatige leads laden</VoiceButton>
                  </div>
                </div>
              ) : form.sourceType === 'contacts' ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {['Warme leads', 'Demo aangevraagd', 'Geen reactie 7d'].map((segment) => (
                    <button
                      key={segment}
                      type="button"
                      onClick={() => selectContactSegment(segment)}
                      className={`rounded-xl border p-4 text-left transition ${form.contactSegment === segment ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-200 bg-white hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]'}`}
                    >
                      <Users className="mb-4 h-5 w-5" />
                      <p className="font-semibold">{segment}</p>
                      <p className={`mt-2 text-sm ${voicePageMuted}`}>Laad een voorbeeld van dit contactsegment.</p>
                    </button>
                  ))}
                </div>
              ) : form.leadRows?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{form.leadFileName || 'Geuploade CSV'}</p>
                      <p className={`text-sm ${voicePageMuted}`}>{form.leadRows.length} leads klaar voor de wachtrij</p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">Valid import</Badge>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-[#303030]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#0000170b] text-zinc-500 dark:bg-[#202020]">
                        <tr>
                          {Object.keys(form.leadRows[0] || {}).slice(0, 4).map((key) => <th key={key} className="px-3 py-2 font-semibold">{key}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {form.leadRows.slice(0, 3).map((row: Record<string, string>, index: number) => (
                          <tr key={index} className="border-t border-zinc-200 dark:border-[#303030]">
                            {Object.keys(form.leadRows[0] || {}).slice(0, 4).map((key) => <td key={key} className="px-3 py-2">{row[key] || '-'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[176px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 text-center transition hover:bg-[#0000170b] dark:border-[#3a3a3a] dark:hover:bg-[#242424]"
                >
                  <Upload className={`mb-4 h-8 w-8 ${voicePageMuted}`} />
                  <span className="font-semibold">Sleep of kies je leads-CSV</span>
                  <span className={`mt-2 text-sm ${voicePageMuted}`}>phone_number, first_name, company, context</span>
                </button>
              )}
              {!form.leadRows?.length && form.sourceType === 'csv' && (
                <div className="mt-4 flex justify-center">
                  <VoiceButton variant="ghost" onClick={loadSampleLeads}>
                    <Sparkles className="h-4 w-4" />
                    Voorbeeldleads laden
                  </VoiceButton>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)} className="flex w-full items-center justify-between text-left">
              <div>
                  <h2 className="text-xl font-bold">Geavanceerde instellingen</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Gelijktijdigheid, retrybeleid en beltijden.</p>
              </div>
              <ChevronDown className={`h-5 w-5 transition ${advancedOpen ? 'rotate-180' : ''}`} />
            </button>
            {advancedOpen && (
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <VoiceField label="Gelijktijdigheid">
                  <Input value={form.maxConcurrency} type="number" min={1} max={25} onChange={(event) => setForm({ ...form, maxConcurrency: Number(event.target.value || 1) })} className={inputClass} />
                </VoiceField>
                <VoiceField label="Retrypogingen">
                  <Input value={form.retryCount || 2} type="number" min={0} max={10} onChange={(event) => setForm({ ...form, retryCount: Number(event.target.value || 0) })} className={inputClass} />
                </VoiceField>
                <VoiceField label="Beltijdvenster">
                  <NativeSelect value={form.callWindow || 'business'} onChange={(value) => setForm({ ...form, callWindow: value })} className="w-full">
                    <option value="business">Kantooruren</option>
                    <option value="evening">Avondopvolging</option>
                    <option value="custom">Aangepast</option>
                  </NativeSelect>
                </VoiceField>
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Startvoorbeeld</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Simuleer de wachtrij voordat je de campagne aanmaakt.</p>
              </div>
              <div className="flex gap-2">
                <VoiceButton variant="ghost" onClick={() => setPreviewState(previewState === 'running' ? 'paused' : 'running')} disabled={!leadCount}>
                  {previewState === 'running' ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {previewState === 'running' ? 'Preview pauzeren' : 'Preview starten'}
                </VoiceButton>
                <VoiceButton variant="ghost" onClick={() => setPreviewState('idle')} disabled={previewState === 'idle'}>
                  Reset
                </VoiceButton>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <CampaignStat label="In wachtrij" value={queueStats.queued} />
              <CampaignStat label="Actieve gesprekken" value={queueStats.active} />
              <CampaignStat label="Afgerond" value={queueStats.completed} />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className={voicePageMuted}>Batchvoortgang</span>
                <span className="font-semibold">{queueProgress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#303030]">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${queueProgress}%` }} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ['Agent', activeAgent?.name || 'Kies een agent'],
                ['Provider', activeTelephony?.name || 'Standaard telefonie'],
                ['Herhaalbeleid', `${form.retryCount || 2} pogingen · ${form.callWindow === 'business' ? 'kantooruren' : form.callWindow || 'venster'}`],
                ['Leadbron', form.leadFileName || form.sourceType || 'CSV'],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>{label}</p>
                  <p className="mt-2 truncate font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">Campagnecockpit</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Een snelle operationele check voor de start.</p>
              </div>
              <Radio className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['Publiek voorbereiden', leadCount ? 'klaar' : 'wachten'],
                ['Credits reserveren', leadCount && activeAgent ? 'klaar' : 'wachten'],
                ['Batch bellen', previewState === 'running' ? 'draait' : previewState === 'paused' ? 'gepauzeerd' : 'wachten'],
                ['Resultaat rapporteren', previewState === 'running' ? 'streaming' : 'inactief'],
              ].map(([label, status], index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${status === 'klaar' || status === 'streaming' ? 'bg-emerald-500 text-white' : status === 'draait' ? 'bg-cyan-500 text-white' : 'bg-zinc-200 text-zinc-500 dark:bg-[#303030]'}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className={`text-xs capitalize ${voicePageMuted}`}>{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Campagnegereedheid</h2>
            <div className="mt-5 space-y-3">
              <ReadinessRow done={Boolean(form.name.trim())} label="Campagne benoemd" />
              <ReadinessRow done={Boolean(form.agentId || agents[0]?.id)} label="Agent geselecteerd" />
              <ReadinessRow done={telephony.length > 0} label="Telefonie gekoppeld" />
              <ReadinessRow done={form.leadRows?.length > 0} label="Leads geladen" />
            </div>
            <VoiceButton aria-label="Campagne maken vanuit gereedheid" onClick={onCreate} disabled={busy || !form.name.trim() || !agents.length} className="mt-6 w-full justify-center">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Campagne maken
            </VoiceButton>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Bestaande campagnes</h2>
            {campaigns.length === 0 ? (
              <p className={`mt-4 text-sm leading-6 ${voicePageMuted}`}>Nog geen campagnes. Je eerste campagne verschijnt hier met voortgang, retries en rapportages.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {campaigns.slice(0, 4).map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`w-full rounded-xl p-4 text-left transition ${selectedCampaignId === campaign.id ? 'border border-cyan-500 bg-cyan-500/10' : voiceSoftPanelClass}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className="w-full rounded-lg text-left outline-none transition hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:bg-white/[0.04]"
                      aria-label={`Select campaign ${campaign.name}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{campaign.name}</p>
                        <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-[#343434] dark:text-zinc-300">{campaign.status || 'draft'}</Badge>
                      </div>
                      <p className={`mt-2 text-sm ${voicePageMuted}`}>{campaign.totalLeads || 0} leads · concurrency {campaign.maxConcurrency || 1}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#303030]">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(Number(campaign.completedLeads || campaign.totalLeads || 0) / Math.max(Number(campaign.totalLeads || 1), 1) * 100, 100)}%` }} />
                      </div>
                    </button>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className={`text-xs ${voicePageMuted}`}>Updated {formatDate(campaign.updatedAt || campaign.createdAt)}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          runCampaignAction(campaign, nextCampaignAction(campaign));
                        }}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold text-[hsl(240_1.7%_11.2%)] transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424]"
                        aria-label={`${nextCampaignAction(campaign)} ${campaign.name}`}
                      >
                        {campaignActionBusy === campaign.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        {nextCampaignAction(campaign)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {campaignActionStatus && (
              <p className={`mt-4 rounded-xl px-3 py-2 text-sm ${campaignActionStatus.toLowerCase().includes('could not') || campaignActionStatus.toLowerCase().includes('failed') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
                {campaignActionStatus}
              </p>
            )}
          </div>

          {selectedCampaign && (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">Geselecteerde campagne</h2>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>{selectedCampaign.name}</p>
                </div>
                <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">{selectedCampaign.status || 'draft'}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <CampaignStat label="Leads" value={Number(selectedCampaign.totalLeads || 0)} />
                <CampaignStat label="Completed" value={Number(selectedCampaign.completedLeads || 0)} />
              </div>
              <div className="mt-5 flex gap-2">
                {(['start', 'pause', 'resume'] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runCampaignAction(selectedCampaign, action)}
                    disabled={campaignActionBusy === selectedCampaign.id}
                    className={`h-9 flex-1 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      nextCampaignAction(selectedCampaign) === action
                        ? 'bg-[hsl(240_1.7%_11.2%)] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950'
                        : 'border border-zinc-200 bg-white text-[hsl(240_1.7%_11.2%)] hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white'
                    }`}
                  >
                    {campaignActionBusy === selectedCampaign.id && nextCampaignAction(selectedCampaign) === action ? 'Working...' : action}
                  </button>
                ))}
              </div>
              <p className={`mt-4 text-xs leading-5 ${voicePageMuted}`}>Deze knoppen gebruiken de native campaign-runner endpoints, zodat statusupdates in dezelfde datalaag terechtkomen als rapportages en runs.</p>
            </div>
          )}
        </aside>
      </div>
    </SectionPage>
  );
}

function ModelsView({ models, modelTab, setModelTab, form, setForm, busy, onSave }: any) {
  const tabs = ['llm', 'voice', 'transcriber', 'embedding'] as const;
  const { data: voiceCatalog } = useSWR('/api/voice/voices', fetcher);
  const providers = voiceCatalog?.providers?.[modelTab === 'voice' ? 'tts' : modelTab === 'transcriber' ? 'stt' : 'llm'] || [];
  const displayedVoices = voiceCatalog?.voices?.length ? voiceCatalog.voices : fallbackVoices();
  const [customModel, setCustomModel] = useState(false);
  const [apiKeySlots, setApiKeySlots] = useState<Array<{ id: string; value: string }>>([{ id: 'primary', value: form.apiKey || '' }]);
  const [selectedVoice, setSelectedVoice] = useState('kyrn-hope');
  const [previewVoice, setPreviewVoice] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ type: 'ok' | 'error'; message: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('fast');
  const [connectionCheck, setConnectionCheck] = useState<'idle' | 'checking' | 'ok'>('idle');
  const modelOptions = modelOptionsForProvider(form.provider, modelTab);
  const recommendedStacks = modelTab === 'voice'
    ? [
        { id: 'quality', title: 'Chirp 3 HD', text: 'Google Chirp 3 HD for the main premium voice layer.', provider: 'google-chirp', model: 'chirp-3-hd' },
        { id: 'gemini-tts', title: 'Gemini TTS', text: 'Gemini 3.1 Flash TTS preview for native voice experiments.', provider: 'gemini-tts', model: 'gemini-3.1-flash-tts-preview' },
        { id: 'elevenlabs', title: 'ElevenLabs fallback', text: 'ElevenLabs for polished sales and support calls.', provider: 'elevenlabs', model: 'eleven_flash_v2_5' },
        { id: 'multilingual', title: 'Multilingual voice', text: 'MiniMax for expressive multilingual campaigns.', provider: 'minimax', model: 'speech-02-hd' },
      ]
    : [
        { id: 'fast', title: 'Gemini 3.1 Flash Live', text: 'Realtime brein voor native audiogesprekken met lage vertraging.', provider: modelTab === 'embedding' ? 'openai' : 'gemini-live', model: modelTab === 'embedding' ? 'text-embedding-3-small' : 'gemini-3.1-flash-live-preview' },
        { id: 'gemini-text', title: 'Gemini 3.1 Flash', text: 'Tekstfallback voor WhatsApp, tools en taken buiten live gesprekken.', provider: 'gemini', model: 'gemini-3.1-flash' },
        { id: 'chatgpt-realtime', title: 'ChatGPT Realtime 2', text: 'ChatGPT-stack voor realtime gesprekken met gpt-realtime-whisper transcripties.', provider: 'openai', model: modelTab === 'transcriber' ? 'gpt-realtime-whisper' : 'gpt-realtime-2' },
        { id: 'sales', title: 'Saleskwaliteit', text: 'MiniMax of OpenAI voor rijkere redenering en toolgebruik.', provider: 'minimax', model: modelTab === 'transcriber' ? 'speech-01' : 'abab6.5s-chat' },
        { id: 'experimental', title: 'Experimenteel', text: 'Xiaomi MiMo-slot voor aankomende providertests.', provider: 'xiaomi-mimo', model: 'mimo-vl-7b' },
      ];

  function selectProvider(providerId: string) {
    const firstModel = modelOptionsForProvider(providerId, modelTab)[0] || 'default';
    setForm({ ...form, provider: providerId, model: firstModel });
    setTestStatus(`${providerId} geselecteerd voor ${modelTab}`);
  }

  function updateApiKeySlot(index: number, value: string) {
    setApiKeySlots((slots) =>
      slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, value } : slot))
    );
    if (index === 0) {
      setForm({ ...form, apiKey: value });
    }
  }

  function addApiKeySlot() {
    setApiKeySlots((slots) => [...slots, { id: `key-${Date.now().toString(36)}`, value: '' }]);
    setTestStatus('Extra API-sleutelveld toegevoegd');
  }

  function removeApiKeySlot(index: number) {
    setApiKeySlots((slots) => slots.filter((_, slotIndex) => slotIndex !== index));
    setTestStatus('Extra API-sleutelveld verwijderd');
  }

  function chooseVoice(voice: any) {
    setSelectedVoice(voice.id);
    setPreviewVoice('');
    setForm({
      ...form,
      provider: voice.provider || form.provider,
      model: voice.model || voice.id,
    });
    setTestStatus(`${voice.name} geselecteerd als primaire stem`);
  }

  function previewVoiceSample(voice: any) {
    setPreviewVoice(voice.id);
    setTestStatus(`Voorbeeld van ${voice.name} speelt`);
  }

  function applyRecommendedStack(stack: (typeof recommendedStacks)[number]) {
    setSelectedPreset(stack.id);
    setConnectionCheck('idle');
    setForm({
      ...form,
      provider: stack.provider,
      model: stack.model,
      realtime: stack.id === 'fast' || stack.provider === 'qwen',
    });
    setTestStatus(`${stack.title} toegepast: ${stack.provider} · ${stack.model}`);
  }

  function runConnectionCheck() {
    setConnectionCheck('checking');
    window.setTimeout(() => {
      setConnectionCheck('ok');
      setTestStatus(`${form.provider || 'Provider'} verbindingsprofiel is klaar om op te slaan`);
    }, 650);
  }

  async function handleSaveConfiguration() {
    setSaveStatus(null);
    try {
      await onSave();
      setSaveStatus({ type: 'ok', message: 'Configuratie opgeslagen. Nieuwe agents kunnen deze stack nu gebruiken.' });
      setTestStatus('Opgeslagen configuratie is klaar voor agentselectie');
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Deze configuratie kon niet worden opgeslagen.',
      });
    }
  }

  return (
    <SectionPage
      title="Modellen"
      description="Configureer LLM-, stem-, transcriptie- en embeddingproviders voor je agents."
      action={<VoiceButton onClick={handleSaveConfiguration} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Configuratie opslaan</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          {saveStatus && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              saveStatus.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'
            }`}>
              {saveStatus.message}
            </div>
          )}
          <div className={`rounded-2xl p-4 ${voicePanelClass}`}>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModelTab(tab)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${modelTab === tab ? 'bg-[hsl(240_1.7%_11.2%)] text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 hover:bg-[#0000170b] dark:text-zinc-400 dark:hover:bg-[#242424]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold">Realtime modus</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Gebruik waar mogelijk een speech-to-speech model, met LLM-fallback voor tools en QA.</p>
              </div>
              <Toggle checked={form.realtime} onChange={() => setForm({ ...form, realtime: !form.realtime })} />
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Provider</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Kies welke service Kyrn moet gebruiken voor {modelTab}.</p>
              </div>
              <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-[#343434] dark:text-zinc-300">{providers.length || 4} available</Badge>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {(providers.length ? providers : fallbackProvidersForTab(modelTab)).map((provider: any) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => selectProvider(provider.id)}
                  className={`rounded-xl border p-4 text-left transition ${form.provider === provider.id ? 'border-[hsl(240_1.7%_11.2%)] bg-[#0000170b] dark:border-white dark:bg-white/10' : 'border-zinc-200 bg-white hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]'}`}
                >
                  <div className="flex items-center gap-3">
                    <ProviderMark provider={provider.id} />
                    <div className="min-w-0">
                      <p className="font-semibold">{provider.name}</p>
                      <p className={`mt-1 truncate text-xs ${voicePageMuted}`}>{provider.description || providerCapability(provider.id, modelTab)}</p>
                    </div>
                    {form.provider === provider.id && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="grid gap-5 md:grid-cols-2">
              <VoiceField label="Model">
                {customModel ? (
                  <Input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Voer een eigen modelnaam in" className={inputClass} />
                ) : (
                  <NativeSelect value={form.model} onChange={(value) => setForm({ ...form, model: value })} className="w-full">
                    {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                  </NativeSelect>
                )}
                <label className={`mt-3 flex cursor-pointer items-center gap-2 text-sm ${voicePageMuted}`}>
                  <input type="checkbox" checked={customModel} onChange={() => setCustomModel(!customModel)} className="accent-cyan-500" />
                  Eigen waarde invoeren
                </label>
              </VoiceField>
              <VoiceField label="Standaardgebruik">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{modelTab === 'voice' ? 'Primaire spraakstack' : `Primaire ${modelTab}-stack`}</p>
                  <p className={`mt-2 text-sm ${voicePageMuted}`}>Nieuwe agents gebruiken deze configuratie tenzij je die overschrijft.</p>
                </div>
              </VoiceField>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">API-sleutels</p>
                  <p className={`text-sm ${voicePageMuted}`}>Sleutels worden afgeschermd en opgeslagen bij je teamconfiguratie.</p>
                </div>
                <VoiceButton variant="ghost" onClick={addApiKeySlot}><Plus className="h-4 w-4" /> Sleutel toevoegen</VoiceButton>
              </div>
              <div className="space-y-3">
                {apiKeySlots.map((slot, index) => (
                  <div key={slot.id} className="flex gap-2">
                    <Input
                      value={index === 0 ? form.apiKey : slot.value}
                      onChange={(event) => updateApiKeySlot(index, event.target.value)}
                      placeholder={index === 0 ? 'sk-...' : 'Extra afgeschermde sleutel'}
                      type="password"
                      className={inputClass}
                    />
                    {index > 0 && (
                      <VoiceButton
                        variant="ghost"
                        onClick={() => removeApiKeySlot(index)}
                        aria-label="API-sleutelveld verwijderen"
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </VoiceButton>
                    )}
                  </div>
                ))}
              </div>
              {testStatus && (
                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                  {testStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {modelTab === 'voice' ? (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <h2 className="font-bold">Stemmenbibliotheek</h2>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>Beluister en kies de primaire stem van de agent.</p>
              <div className="mt-5 space-y-3">
                {displayedVoices.map((voice: any) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => chooseVoice(voice)}
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedVoice === voice.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-200 hover:bg-[#0000170b] dark:border-[#343434] dark:hover:bg-[#242424]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[conic-gradient(from_90deg,#0b5fff,#66e4d5,#e8fbff,#0b5fff)]" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{voice.name}</p>
                        <p className={`text-xs ${voicePageMuted}`}>{voice.provider} · {voice.style}</p>
                      </div>
                      {selectedVoice === voice.id && <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">Primair</Badge>}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          previewVoiceSample(voice);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            previewVoiceSample(voice);
                          }
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-zinc-200 dark:hover:bg-[#242424]"
                        aria-label={`${voice.name} beluisteren`}
                      >
                        <Play className="h-4 w-4" />
                      </span>
                    </div>
                    <div className={`mt-4 h-7 rounded-full ${previewVoice === voice.id ? 'animate-pulse bg-[repeating-linear-gradient(90deg,rgba(20,184,166,.85)_0_5px,transparent_5px_11px)]' : 'bg-[repeating-linear-gradient(90deg,rgba(20,184,166,.35)_0_4px,transparent_4px_10px)]'}`} />
                    {previewVoice === voice.id && <p className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-300">Voorbeeld speelt</p>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <h2 className="font-bold">Aanbevolen stack</h2>
              <div className="mt-5 space-y-3">
                {recommendedStacks.map((stack) => (
                  <button
                    key={stack.id}
                    type="button"
                    onClick={() => applyRecommendedStack(stack)}
                    className={`w-full rounded-xl p-4 text-left transition ${selectedPreset === stack.id ? 'border border-cyan-500 bg-cyan-500/10' : voiceSoftPanelClass}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{stack.title}</p>
                      {selectedPreset === stack.id && <CheckCircle2 className="h-4 w-4 text-cyan-500" />}
                    </div>
                    <p className={`mt-2 text-sm leading-5 ${voicePageMuted}`}>{stack.text}</p>
                    <p className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-300">{stack.provider} · {stack.model}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Verbindingscheck</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Controleer de zichtbare stack voordat je die voor agents opslaat.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Provider</p>
                <p className="mt-2 truncate font-semibold">{form.provider || 'Niet geselecteerd'}</p>
              </div>
              <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Model</p>
                <p className="mt-2 truncate font-semibold">{form.model || 'Standaard'}</p>
              </div>
            </div>
            <VoiceButton variant="ghost" onClick={runConnectionCheck} className="mt-5 w-full justify-center">
              {connectionCheck === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {connectionCheck === 'ok' ? 'Profiel klaar' : connectionCheck === 'checking' ? 'Controleren...' : 'Check uitvoeren'}
            </VoiceButton>
          </div>

          <Panel title="Opgeslagen configuraties" subtitle="Herbruikbare modelstacks voor dit team">
            {models.length === 0 ? (
              <p className={`text-sm leading-6 ${voicePageMuted}`}>Nog geen modelconfiguraties opgeslagen. Sla deze setup op om hem beschikbaar te maken voor agents.</p>
            ) : (
              <RecordList rows={models.slice(0, 4)} detail={(row) => `${row.llmProvider || row.ttsProvider || 'provider'} · ${row.llmModel || row.ttsModel || 'default'}`} />
            )}
          </Panel>
        </aside>
      </div>
    </SectionPage>
  );
}

function TelephonyView({ telephony, onAdd }: { telephony: any[]; onAdd: (provider?: string) => void }) {
  const [selectedProvider, setSelectedProvider] = useState('twilio');
  const [selectedConfigId, setSelectedConfigId] = useState<string | number>(telephony[0]?.id || 'new');
  const [routedNumbers, setRoutedNumbers] = useState<Record<string, string>>({});
  const [lastTestedNumber, setLastTestedNumber] = useState('');
  const [telephonyCheck, setTelephonyCheck] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const selectedConfig = telephony.find((config) => config.id === selectedConfigId);
  const providers = [
    { id: 'twilio', name: 'Twilio', text: 'Productieklare inkomende en uitgaande gesprekken', icon: Phone },
    { id: 'sip', name: 'LiveKit SIP', text: 'Aanbevolen voor realtime routering', icon: Radio },
    { id: 'asterisk_ari', name: 'Asterisk ARI', text: 'Zelfgehoste PBX-koppeling', icon: Cable },
  ];

  useEffect(() => {
    if (selectedConfigId !== 'new' || !telephony.length) return;
    setSelectedConfigId(telephony[0].id);
    setSelectedProvider(telephony[0].provider || 'twilio');
  }, [selectedConfigId, telephony]);

  return (
    <SectionPage
      title="Telefonie"
      description="Koppel belproviders, wijs telefoonnummers toe en routeer inkomend verkeer naar de juiste spraakagent."
      action={<VoiceButton onClick={() => onAdd(selectedProvider)}><Plus className="h-4 w-4" /> Configuratie toevoegen</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Providers</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Kies een provider om te configureren of de routeringsstatus te bekijken.</p>
              </div>
              <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">Runtime klaar</Badge>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {providers.map((provider) => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`rounded-xl border p-4 text-left transition ${selectedProvider === provider.id ? 'border-[hsl(240_1.7%_11.2%)] bg-[#0000170b] dark:border-white dark:bg-white/10' : 'border-zinc-200 bg-white hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]'}`}
                  >
                    <Icon className="mb-5 h-5 w-5" />
                    <p className="font-semibold">{provider.name}</p>
                    <p className={`mt-2 text-sm leading-5 ${voicePageMuted}`}>{provider.text}</p>
                    <span className="mt-5 inline-flex text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                      {selectedProvider === provider.id ? 'Geselecteerd' : 'Selecteren'}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <VoiceButton variant="ghost" onClick={() => onAdd(selectedProvider)}>
                <Plus className="h-4 w-4" /> {providers.find((provider) => provider.id === selectedProvider)?.name} configureren
              </VoiceButton>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Configuraties</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Provideraccounts beschikbaar voor testgesprekken en campagnes.</p>
              </div>
              <VoiceButton variant="ghost" onClick={() => onAdd(selectedProvider)}><Plus className="h-4 w-4" /> Nieuwe configuratie</VoiceButton>
            </div>
            {telephony.length === 0 ? (
              <div className={`mt-6 rounded-xl p-6 ${voiceSoftPanelClass}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Nog geen telefonieconfiguraties</p>
                    <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>Voeg Twilio- of LiveKit SIP-instellingen toe voor browsergesprekken, inkomende nummers, uitgaande tests en campagnebellen.</p>
                    <VoiceButton onClick={() => onAdd(selectedProvider)} className="mt-5"><Plus className="h-4 w-4" /> Configuratie toevoegen</VoiceButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {telephony.map((config) => (
                  <button
                    key={config.id}
                    type="button"
                    onClick={() => {
                      setSelectedConfigId(config.id);
                      setSelectedProvider(config.provider || 'twilio');
                      setTelephonyCheck('');
                    }}
                    className={`w-full rounded-xl p-4 text-left transition ${selectedConfigId === config.id ? 'border border-cyan-500 bg-cyan-500/10' : voiceSoftPanelClass}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{config.name}</p>
                        <p className={`mt-1 text-sm ${voicePageMuted}`}>{config.provider || 'twilio'} · {config.isDefaultOutbound ? 'standaard uitgaand' : 'handmatige selectie'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConfigId === config.id && <CheckCircle2 className="h-4 w-4 text-cyan-500" />}
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">Gekoppeld</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Geselecteerde setup</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>{selectedConfig ? 'Controleer deze provider voordat je live gesprekken routeert.' : 'Selecteer een providerkaart of maak een configuratie.'}</p>
            <div className={`mt-5 rounded-xl p-4 ${voiceSoftPanelClass}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Provider</p>
              <p className="mt-2 font-semibold">{selectedConfig?.name || providers.find((provider) => provider.id === selectedProvider)?.name || 'Nieuwe configuratie'}</p>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>{selectedConfig?.provider || selectedProvider} · {selectedConfig?.isDefaultOutbound ? 'standaard uitgaand' : 'klaar om te configureren'}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <VoiceButton
                variant="ghost"
                onClick={() => setTelephonyCheck(`Inkomende route gecontroleerd voor ${selectedConfig?.name || selectedProvider}`)}
                className="justify-center"
              >
                <Phone className="h-4 w-4" /> Inkomend testen
              </VoiceButton>
              <VoiceButton
                variant="ghost"
                onClick={() => {
                  setCopiedWebhook(true);
                  setTelephonyCheck('Webhook-URL gekopieerd voor runtime-events');
                }}
                className="justify-center"
              >
                <Code2 className="h-4 w-4" /> {copiedWebhook ? 'Gekopieerd' : 'Webhook'}
              </VoiceButton>
            </div>
            {telephonyCheck && (
              <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                {telephonyCheck}
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Telefoonnummers</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Routeer elk nummer naar een spraakagent.</p>
            <div className="mt-5 space-y-3">
              {[
                ['+31 20 000 0000', 'Inkomend demonummer', 'Niet toegewezen'],
                ['+1 555 0199', 'Uitgaand caller ID', 'Standaard'],
              ].map(([number, label, status]) => (
                <div key={number} className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{number}</p>
                      <p className={`mt-1 text-sm ${voicePageMuted}`}>{label}</p>
                      {routedNumbers[number] && <p className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300">Gerouteerd naar {routedNumbers[number]}</p>}
                      {lastTestedNumber === number && <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">Test-event verzonden</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-[#343434] dark:text-zinc-300">{routedNumbers[number] ? 'Toegewezen' : status}</Badge>
                      <button
                        type="button"
                        aria-label={`${routedNumbers[number] ? 'Route wissen voor' : 'Toewijzen'} ${number}`}
                        onClick={() => setRoutedNumbers((current) => ({ ...current, [number]: current[number] ? '' : 'Standaard spraakagent' }))}
                        className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
                      >
                        {routedNumbers[number] ? 'Route wissen' : 'Toewijzen'}
                      </button>
                      <button
                        type="button"
                        aria-label={`Test ${number}`}
                        onClick={() => setLastTestedNumber(number)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Belroutering</h2>
            <div className="mt-5 space-y-3">
              <ReadinessRow done={telephony.length > 0} label="Providergegevens" />
              <ReadinessRow done={telephony.length > 0} label="Uitgaand caller ID" />
              <ReadinessRow done={Object.values(routedNumbers).some(Boolean)} label="Inkomend nummer gekoppeld" />
              <ReadinessRow done={lastTestedNumber.length > 0} label="Testroute-event" />
            </div>
          </div>
        </aside>
      </div>
    </SectionPage>
  );
}

function ToolsView({ tools, onCreate }: { tools: any[]; onCreate: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [enabledSystemTools, setEnabledSystemTools] = useState(['end_call', 'calculator']);
  const [selectedToolId, setSelectedToolId] = useState<string | number>('system:end_call');
  const [transferNumber, setTransferNumber] = useState('+31 20 000 0000');
  const [toolTestStatus, setToolTestStatus] = useState('');
  const filteredTools = tools.filter((tool) => {
    const matchesQuery = !query || `${tool.name || ''} ${tool.description || ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'all' || tool.category === category;
    return matchesQuery && matchesCategory;
  });
  const systemTools = [
    ['end_call', 'Gesprek beeindigen', 'Laat de agent een gesprek netjes afronden.'],
    ['transfer_call', 'Doorverbinden naar nummer', 'Stuur een beller door naar een medewerker of afdeling.'],
    ['calculator', 'Rekenmachine', 'Voer eenvoudige berekeningen uit tijdens een gesprek.'],
    ['webhook', 'Webhooktool', 'Roep een intern event-endpoint aan.'],
  ];
  const selectedCustomTool = tools.find((tool) => tool.id === selectedToolId);
  const selectedSystemTool = systemTools.find(([id]) => selectedToolId === `system:${id}`);

  function runToolTest() {
    if (selectedCustomTool) {
      setToolTestStatus(`Testpayload voor ${selectedCustomTool.name} staat klaar`);
      return;
    }
    if (selectedSystemTool) {
      if (!enabledSystemTools.includes(selectedSystemTool[0])) {
        setToolTestStatus(`Schakel ${selectedSystemTool[1]} in voordat je test`);
        return;
      }
      setToolTestStatus(`${selectedSystemTool[1]} staat klaar in de runtime-toolkit`);
    }
  }

  return (
    <SectionPage
      title="Tools"
      description="Beheer herbruikbare acties die je spraakagents tijdens een gesprek kunnen aanroepen."
      action={<VoiceButton onClick={onCreate}><Plus className="h-4 w-4" /> Tool maken</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Je tools</h2>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>HTTP API's, doorverbinden, belacties en hulpfuncties.</p>
            </div>
            <VoiceButton variant="ghost" onClick={onCreate}><Plus className="h-4 w-4" /> Tool toevoegen</VoiceButton>
          </div>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tools zoeken..." className={`${inputClass} pl-9`} />
            </div>
            <NativeSelect value={category} onChange={setCategory}>
              <option value="all">Alle types</option>
              <option value="http_api">HTTP API</option>
              <option value="end_call">Gesprek afronden</option>
              <option value="transfer_call">Transfer</option>
              <option value="calculator">Calculator</option>
            </NativeSelect>
          </div>
          {filteredTools.length === 0 ? (
            <div className={`mt-6 rounded-xl p-8 text-center ${voiceSoftPanelClass}`}>
              <Wrench className={`mx-auto mb-4 h-8 w-8 ${voicePageMuted}`} />
              <p className="font-semibold">{tools.length ? 'Geen tools gevonden voor dit filter' : 'Nog geen eigen tools'}</p>
              <p className={`mx-auto mt-2 max-w-md text-sm leading-6 ${voicePageMuted}`}>Maak een HTTP-tool, doorverbindactie, calculator of webhook zodat agents tijdens een gesprek echt werk kunnen doen.</p>
              <VoiceButton onClick={onCreate} className="mt-5"><Plus className="h-4 w-4" /> Tool maken</VoiceButton>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-[#303030] dark:border-[#303030]">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition ${selectedToolId === tool.id ? 'bg-cyan-500/10' : 'hover:bg-[#0000170b] dark:hover:bg-[#242424]'}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0000170b] text-[hsl(240_1.7%_11.2%)] dark:bg-cyan-500/10 dark:text-cyan-300">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{tool.name}</p>
                      <p className={`truncate text-sm ${voicePageMuted}`}>{tool.description || tool.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-[#343434] dark:text-zinc-300">{tool.category || 'tool'}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Systeemtools</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Ingebouwde acties die beschikbaar zijn voor de runtime.</p>
            <div className="mt-5 space-y-3">
              {systemTools.map(([id, title, description]) => (
                <div
                  key={id}
                  className={`w-full rounded-xl p-4 transition ${selectedToolId === `system:${id}` ? 'bg-cyan-500/10 ring-1 ring-cyan-500/50' : voiceSoftPanelClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedToolId(`system:${id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-semibold">{title}</p>
                      <p className={`mt-2 text-sm leading-5 ${voicePageMuted}`}>{description}</p>
                    </button>
                    <Toggle
                      checked={enabledSystemTools.includes(id)}
                      ariaLabel={`${enabledSystemTools.includes(id) ? 'Uitschakelen' : 'Inschakelen'} ${title}`}
                      onChange={() => {
                        setEnabledSystemTools((current) =>
                          current.includes(id) ? current.filter((toolId) => toolId !== id) : [...current, id]
                        );
                        setToolTestStatus(
                          enabledSystemTools.includes(id)
                            ? `${title} uitgeschakeld voor runtime`
                            : `${title} ingeschakeld voor runtime`
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Tooldetails</h2>
            {selectedCustomTool ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{selectedCustomTool.name}</p>
                  <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>{selectedCustomTool.description || 'Nog geen beschrijving.'}</p>
                </div>
                <ReadinessRow done label="Beschikbaar voor agents" />
                <ReadinessRow done={selectedCustomTool.status === 'active'} label="Actieve status" />
                <VoiceButton variant="ghost" onClick={runToolTest} className="w-full justify-center"><Play className="h-4 w-4" /> Payload testen</VoiceButton>
                <VoiceButton variant="ghost" onClick={onCreate} className="w-full justify-center"><Plus className="h-4 w-4" /> Nog een tool toevoegen</VoiceButton>
              </div>
            ) : selectedSystemTool ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{selectedSystemTool[1]}</p>
                  <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>{selectedSystemTool[2]}</p>
                </div>
                {selectedSystemTool[0] === 'transfer_call' && (
                  <VoiceField label="Doorverbindnummer" help="Wordt gebruikt wanneer een workflowstap doorschakelen inschakelt.">
                    <Input value={transferNumber} onChange={(event) => setTransferNumber(event.target.value)} className={inputClass} />
                  </VoiceField>
                )}
                <ReadinessRow done={enabledSystemTools.includes(selectedSystemTool[0])} label="Ingeschakeld voor runtime" />
                <ReadinessRow done label="Geen inloggegevens nodig" />
                <ReadinessRow done={selectedSystemTool[0] !== 'transfer_call' || Boolean(transferNumber.trim())} label={selectedSystemTool[0] === 'transfer_call' ? 'Doorverbindnummer ingesteld' : 'Klaar om uit te voeren'} />
                <VoiceButton variant="ghost" onClick={runToolTest} className="w-full justify-center"><Play className="h-4 w-4" /> Tool testen</VoiceButton>
              </div>
            ) : (
              <p className={`mt-5 text-sm leading-6 ${voicePageMuted}`}>Selecteer een eigen tool of systeemtool om te zien hoe agents die kunnen gebruiken.</p>
            )}
            {toolTestStatus && (
              <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                {toolTestStatus}
              </div>
            )}
          </div>
        </aside>
      </div>
    </SectionPage>
  );
}

function FilesView({ files, onUpload }: { files: any[]; onUpload: () => void }) {
  return (
    <SectionPage
      title="Kennisbankbestanden"
      description="Upload en beheer documenten die je spraakagents mogen raadplegen."
      action={<VoiceButton onClick={onUpload}><Upload className="h-4 w-4" /> Document uploaden</VoiceButton>}
    >
      <Panel title="Je documenten" subtitle="Documenten die gedeeld worden met alle agents in je organisatie">
        <div className="flex gap-3">
          <SearchRow className="flex-1" placeholder="Documenten zoeken..." />
          <VoiceButton variant="ghost"><RefreshCw className="h-4 w-4" /></VoiceButton>
        </div>
        {files.length === 0 ? <div className="min-h-[220px]" /> : <RecordList rows={files} detail={(row) => `${row.processingStatus || 'ready'} ${row.mimeType || ''}`} />}
      </Panel>
    </SectionPage>
  );
}

function RecordingsView({ recordings, onUpload }: { recordings: any[]; onUpload: () => void }) {
  return (
    <SectionPage
      title="Opnames"
      description="Beheer audio-opnames voor je organisatie. Gebruik @ in promptvelden om ze in te voegen."
      action={<VoiceButton onClick={onUpload}><Upload className="h-4 w-4" /> Opname uploaden</VoiceButton>}
    >
      <Panel title="Alle opnames" subtitle="Audio-opnames die gedeeld worden met alle agents in je organisatie">
        <div className="flex gap-3">
          <SearchRow className="flex-1" placeholder="Zoek op bestandsnaam, transcript of ID..." />
          <VoiceButton variant="ghost"><RefreshCw className="h-4 w-4" /></VoiceButton>
        </div>
        <p className="mt-4 text-sm text-zinc-500">{recordings.length} recordings</p>
        {recordings.length > 0 && <RecordList rows={recordings} detail={(row) => row.transcript || row.mimeType || 'audiobestand'} />}
      </Panel>
    </SectionPage>
  );
}

function DevelopersView({ data }: { data: any }) {
  const keys = data?.apiKeys || [];
  return (
    <SectionPage title="Ontwikkelaarsportaal" description="Beheer API-sleutels om Kyrn voice-services programmatisch te gebruiken">
      <div className="space-y-6">
        <DeveloperKeyPanel
          title="API-sleutels"
          subtitle="Maak en beheer API-sleutels voor je organisatie"
          keys={keys}
          button="Nieuwe sleutel maken"
          prefix="dgr_Eo9o..."
        />
        <DeveloperKeyPanel
          title="Kyrn servicesleutels"
          subtitle="Beheer servicesleutels voor AI-diensten (LLM, TTS, STT)"
          keys={[{ id: 'service', name: 'Standaard Kyrn modelservicesleutel', createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() }]}
          button="Servicesleutel maken"
          prefix="mps_sk_pqV..."
        />
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm text-amber-700 dark:text-amber-200">
          <strong>Belangrijk:</strong> houd API-sleutels geheim. Deel ze nooit publiek en commit ze niet naar versiebeheer.
        </div>
      </div>
    </SectionPage>
  );
}

function RunsView({ runs, overview }: { runs: any[]; overview: any }) {
  const totalCredits = 500;
  const used = Number(overview?.creditsUsed ?? runs.reduce((sum, run) => sum + Number(run.creditsUsed || 0), 0));
  const remaining = Math.max(totalCredits - used, 0);
  return (
    <SectionPage
      title="Agentruns"
      description="Bekijk alle runs van je spraakagents. Gebruik filters om specifieke runs terug te vinden."
      action={<NativeSelect value="amsterdam" onChange={() => {}}><option value="amsterdam">(GMT+2:00) Amsterdam, Berlin, Bern...</option></NativeSelect>}
    >
      <Panel title="Kyrn modelcredits" subtitle="Deze meten gebruik van Kyrn-modellen via teamservicesleutels.">
        <div className="mt-8 flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold">{used.toFixed(2)}</span>
            <span className={`ml-2 ${voicePageMuted}`}>/ {totalCredits.toFixed(2)}</span>
            <p className={`text-sm ${voicePageMuted}`}>Credits gebruikt</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{remaining.toFixed(2)}</p>
            <p className={`text-sm ${voicePageMuted}`}>Resterend</p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#4a4a4a]">
          <div className="h-full rounded-full bg-[hsl(240_1.7%_11.2%)] dark:bg-zinc-100" style={{ width: `${Math.min((used / totalCredits) * 100, 100)}%` }} />
        </div>
      </Panel>
      <Panel title="Workflow-runs filteren" subtitle="Maak filters om specifieke workflow-runs te vinden">
        <div className="mt-5 flex items-center justify-between gap-4">
          <NativeSelect value="" onChange={() => {}} className="flex-1"><option value="">Selecteer attribuut om op te filteren</option></NativeSelect>
          <VoiceButton variant="ghost">Sjablonen</VoiceButton>
        </div>
      </Panel>
      <Panel title="Alle runs" subtitle="Elke agent-run in je organisatie, inclusief gebruiksdetails">
        <div className="mt-7 overflow-hidden rounded-lg border border-zinc-200 dark:border-[#2c2c2c]">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#0000170b] text-left text-zinc-500 dark:bg-[#202020] dark:text-zinc-400">
              <tr>
                {['Run-ID', 'Agentnaam', 'Gesprekstype', 'Telefoonnummer', 'Resultaat', 'Datum', 'Duur', 'Tokens', 'Acties'].map((head) => (
                  <th key={head} className="px-4 py-4 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">Nog geen runs.</td></tr>
              ) : runs.map((run) => (
                <tr key={run.id} className="border-t border-zinc-200 dark:border-[#2c2c2c]">
                  <td className="px-4 py-4 font-semibold">#{run.id}</td>
                  <td className="px-4 py-4">{run.agentName || `Agent #${run.agentId}`}</td>
                  <td className="px-4 py-4"><Globe2 className={`inline h-4 w-4 ${voicePageMuted}`} /></td>
                  <td className={`px-4 py-4 ${voicePageMuted}`}>{run.toNumber || '-'}</td>
                  <td className="px-4 py-4"><Badge className="bg-zinc-100 text-zinc-900">{run.status || 'completed'}</Badge></td>
                  <td className="px-4 py-4">{formatDate(run.createdAt || run.startedAt)}</td>
                  <td className="px-4 py-4">7s</td>
                  <td className="px-4 py-4 font-semibold">0,001</td>
                  <td className="px-4 py-4"><VoiceButton variant="ghost"><Headphones className="h-4 w-4" /></VoiceButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </SectionPage>
  );
}

function ReportsView({ reports, runs, agents }: { reports: any[]; runs: any[]; agents: any[] }) {
  const totalRuns = reports.reduce((sum, row) => sum + Number(row.runs || 0), 0);
  return (
    <SectionPage
      title="Dagrapportages"
      description="Data wordt getoond in de tijdzone Europe/Amsterdam"
      action={(
        <div className="flex gap-3">
          <NativeSelect value="all" onChange={() => {}}><option value="all">Alle workflows</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</NativeSelect>
          <VoiceButton variant="ghost"><Calendar className="h-4 w-4" /> May 24, 2026</VoiceButton>
        </div>
      )}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricPanel title="Totale workflow-runs" value={totalRuns} description="Totaal aantal verwerkte gesprekken vandaag" />
        <MetricPanel title="Doorverbindresultaten" value={0} description="Doorverbonden gesprekken (XFER)" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Resultaatverdeling">
          <div className={`flex h-[320px] items-center justify-center ${voicePageMuted}`}>Geen resultaatdata beschikbaar</div>
        </Panel>
        <Panel title="Verdeling gespreksduur">
          <div className="relative mt-5 h-[300px] border-l border-b border-zinc-300 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:95px_65px] dark:border-[#4a4a4a] dark:bg-[linear-gradient(#242424_1px,transparent_1px),linear-gradient(90deg,#242424_1px,transparent_1px)]">
            <div className="absolute bottom-[-28px] left-0 grid w-full grid-cols-6 text-center text-xs text-zinc-500">
              {['0-10s', '10-30s', '30-60s', '60-120s', '120-180s', '>180s'].map((label) => <span key={label}>{label}</span>)}
            </div>
          </div>
        </Panel>
      </div>
      <div className={`rounded-lg px-6 py-8 text-center ${voicePanelClass} ${voicePageMuted}`}>
        {runs.length === 0 ? 'Geen workflow-runs gevonden voor 24 mei 2026' : `${runs.length} workflow-runs gevonden voor 24 mei 2026`}
      </div>
    </SectionPage>
  );
}

function EditorView(props: {
  agent: any;
  nodes: FlowNode[];
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  setEditNode: (node: FlowNode) => void;
  onBack: () => void;
  onRun: () => void;
  testMode: 'audio' | 'chat';
  setTestMode: (mode: 'audio' | 'chat') => void;
  testRunning: boolean;
  testEnded: boolean;
  testTranscript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  runtimeSession: any;
  unsaved: boolean;
  onSaveWorkflow: (publish?: boolean) => Promise<void>;
  onAddNode: (kind?: AddableFlowNodeKind) => void;
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void;
  firstCallTip: boolean;
  setFirstCallTip: (value: boolean) => void;
  editNode: FlowNode | null;
  onCloseEditNode: () => void;
  onSaveEditNode: (node: FlowNode) => void;
}) {
  const { agent, nodes, selectedNodeId, setSelectedNodeId, setEditNode, onBack, onRun, testMode, setTestMode, testRunning, testEnded, testTranscript, runtimeSession, unsaved, onSaveWorkflow, onAddNode, onMoveNode, firstCallTip, setFirstCallTip, editNode, onCloseEditNode, onSaveEditNode } = props;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const flowDotColor = isDark ? '#285066' : '#d7dee7';
  const reactFlowNodes = useMemo(() => nodes.map((node, index) => ({
    id: node.id,
    type: 'kyrnVoiceNode',
    position: { x: node.x, y: node.y },
    data: { node, index, onEdit: setEditNode },
    selected: node.id === selectedNodeId,
  })), [nodes, selectedNodeId, setEditNode]);
  const reactFlowEdges = useMemo(() => {
    const moduleNodes = nodes.filter((node) => isWorkflowModuleNode(node));
    const firstModule = moduleNodes[0]?.id || '';
    const endId = nodeIdByKind(nodes, 'end');
    const edges = [
      { id: 'start-module', source: nodeIdByKind(nodes, 'start'), target: firstModule, type: 'kyrnVoiceEdge', data: { label: 'Naar eerste stap' } },
      { id: 'global-module', source: nodeIdByKind(nodes, 'global'), target: firstModule, type: 'kyrnVoiceEdge', data: { label: 'Context toepassen' } },
      ...moduleNodes.slice(0, -1).map((node, index) => ({
        id: `module-${node.id}-${moduleNodes[index + 1].id}`,
        source: node.id,
        target: moduleNodes[index + 1].id,
        type: 'kyrnVoiceEdge',
        data: { label: 'Doorgaan' },
      })),
      { id: 'module-end', source: moduleNodes[moduleNodes.length - 1]?.id || '', target: endId, type: 'kyrnVoiceEdge', data: { label: 'Gesprek beëindigen' } },
    ];
    return edges.filter((edge) => edge.source && edge.target);
  }, [nodes]);
  const workflowValidation = useMemo(() => validateFlowNodes(nodes), [nodes]);
  const saveDisabled = !workflowValidation.valid;
  const nodeTypes = useMemo(() => ({ kyrnVoiceNode: KyrnReactFlowNode }), []);
  const edgeTypes = useMemo(() => ({ kyrnVoiceEdge: KyrnReactFlowEdge }), []);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [sidePanelMode, setSidePanelMode] = useState<WorkflowSidePanelMode>('test');
  const [flowResetVersion, setFlowResetVersion] = useState(0);
  const showSidePanel = Boolean(editNode || testPanelOpen);
  const openWorkflowSidePanel = (mode: WorkflowSidePanelMode) => {
    setFirstCallTip(false);
    onCloseEditNode();
    setSidePanelMode(mode);
    setTestPanelOpen(true);
  };
  const bottomToolbarActions = [
    { icon: Plus, label: 'Agentstap toevoegen', onClick: () => onAddNode('agent') },
    { icon: RefreshCw, label: 'Canvasweergave resetten', onClick: () => setFlowResetVersion((version) => version + 1) },
    {
      icon: Settings2,
      label: 'Workflowopties',
      active: sidePanelMode === 'options' && !editNode,
      onClick: () => openWorkflowSidePanel('options'),
    },
    {
      icon: MoreVertical,
      label: 'Meer workflowacties',
      active: sidePanelMode === 'more' && !editNode,
      onClick: () => openWorkflowSidePanel('more'),
    },
  ];

  return (
    <div className="flex h-screen min-h-[780px] flex-col overflow-hidden bg-[#f8f8f7] text-[hsl(240_1.7%_11.2%)] dark:bg-[#050505] dark:text-white">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-[#252525] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-semibold">{agent.name}</h1>
          <Pencil className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex items-center gap-3">
          <VoiceButton
            variant="ghost"
            onClick={() => openWorkflowSidePanel('versions')}
            title="Workflowversies"
            aria-label="Workflowversies"
          >
            <RefreshCw className="h-4 w-4" /> v1 (Gepubliceerd)
          </VoiceButton>
          {unsaved && <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300">Niet-opgeslagen wijzigingen</span>}
          <VoiceButton
            variant="ghost"
            onClick={() => openWorkflowSidePanel('phone')}
            title="Belinstellingen"
            aria-label="Belinstellingen"
          >
            <Phone className="h-4 w-4" /> Telefoongesprek
          </VoiceButton>
          <VoiceButton
            variant="ghost"
            onClick={() => {
              if (editNode || !testPanelOpen || sidePanelMode !== 'test') {
                onCloseEditNode();
                setSidePanelMode('test');
                setTestPanelOpen(true);
                return;
              }
              onRun();
            }}
          >
            <Bot className="h-4 w-4" /> Agent testen
          </VoiceButton>
          <VoiceButton
            onClick={() => onSaveWorkflow(false)}
            disabled={saveDisabled}
            title={saveDisabled ? workflowValidation.errors[0] : 'Workflow opslaan'}
            className="bg-[#0f8f85] text-white hover:bg-[#0b746c]"
          >
            <Save className="h-4 w-4" /> Opslaan
          </VoiceButton>
          <VoiceButton
            variant="ghost"
            onClick={() => onSaveWorkflow(true)}
            disabled={saveDisabled}
            title={saveDisabled ? workflowValidation.errors[0] : 'Workflow publiceren'}
          >
            Publiceren
          </VoiceButton>
          <button
            type="button"
            onClick={() => openWorkflowSidePanel('more')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-[#242424] dark:hover:text-white"
            aria-label="Meer workflowacties"
            title="Meer workflowacties"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[#edf3f7] dark:bg-[#050505]">
          <div className="absolute right-4 top-4 z-10 space-y-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-[#333] dark:bg-[#181818]">
              {(Object.entries(workflowModuleTemplates) as Array<[AddableFlowNodeKind, typeof workflowModuleTemplates[AddableFlowNodeKind]]>).map(([kind, template]) => {
                const Icon = template.icon;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => onAddNode(kind)}
                    title={`${template.label} toevoegen`}
                    aria-label={`${template.label} toevoegen`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-[#242424] dark:hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => openWorkflowSidePanel('options')}
              title="Workflowopties"
              aria-label="Workflowopties"
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-[#333] dark:bg-[#181818] dark:text-zinc-200 dark:hover:bg-[#242424] ${sidePanelMode === 'options' && !editNode ? 'ring-2 ring-cyan-500' : ''}`}
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
          <ReactFlow
            key={`workflow-canvas-${flowResetVersion}`}
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.35}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onNodeDragStop={(_, node) => onMoveNode(node.id, node.position)}
            className="kyrn-react-flow"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color={flowDotColor} />
            <Controls className="!bottom-6 !left-8 !top-auto !border-zinc-200 !bg-white !text-zinc-700 shadow-sm dark:!border-[#373737] dark:!bg-[#181818] dark:!text-zinc-200" />
          </ReactFlow>
          <div className="absolute bottom-6 left-8 flex gap-2">
            {bottomToolbarActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                title={action.label}
                aria-label={action.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-[#373737] dark:bg-[#181818] dark:text-zinc-200 dark:hover:bg-[#242424] ${action.active ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <action.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        {showSidePanel && (
          <aside className="relative w-[420px] shrink-0 border-l border-zinc-200 bg-[#fbfbfa] p-4 dark:border-[#252525] dark:bg-[#080808]">
            {editNode ? (
              <NodeSidePanel node={editNode} onBack={onCloseEditNode} onSave={onSaveEditNode} />
            ) : sidePanelMode === 'options' ? (
              <WorkflowOptionsSidePanel
                agent={agent}
                nodes={nodes}
                unsaved={unsaved}
                validation={workflowValidation}
                onAddNode={onAddNode}
                onShowTest={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(true);
                }}
                onClose={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(false);
                }}
              />
            ) : sidePanelMode === 'versions' ? (
              <WorkflowVersionsSidePanel
                agent={agent}
                unsaved={unsaved}
                onSaveDraft={() => onSaveWorkflow(false)}
                onPublish={() => onSaveWorkflow(true)}
                onShowTest={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(true);
                }}
                onClose={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(false);
                }}
              />
            ) : sidePanelMode === 'phone' ? (
              <PhoneCallSidePanel
                agent={agent}
                onRun={onRun}
                onShowTest={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(true);
                }}
                onClose={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(false);
                }}
              />
            ) : sidePanelMode === 'more' ? (
              <MoreWorkflowActionsSidePanel
                unsaved={unsaved}
                validation={workflowValidation}
                onAddNode={onAddNode}
                onSaveDraft={() => onSaveWorkflow(false)}
                onPublish={() => onSaveWorkflow(true)}
                onShowVersions={() => {
                  setSidePanelMode('versions');
                  setTestPanelOpen(true);
                }}
                onShowOptions={() => {
                  setSidePanelMode('options');
                  setTestPanelOpen(true);
                }}
                onShowPhone={() => {
                  setSidePanelMode('phone');
                  setTestPanelOpen(true);
                }}
                onShowTest={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(true);
                }}
                onClose={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(false);
                }}
              />
            ) : (
              <TestAgentSidePanel
                testMode={testMode}
                setTestMode={setTestMode}
                testRunning={testRunning}
                testEnded={testEnded}
                testTranscript={testTranscript}
                runtimeSession={runtimeSession}
                onRun={onRun}
                onClose={() => {
                  setSidePanelMode('test');
                  setTestPanelOpen(false);
                }}
              />
            )}
            {!editNode && sidePanelMode === 'test' && firstCallTip && (
              <div className="absolute bottom-28 right-32 w-96 rounded-lg bg-blue-500 p-6 text-white shadow-2xl">
                <button onClick={() => setFirstCallTip(false)} className="absolute right-4 top-4"><X className="h-4 w-4" /></button>
                <h3 className="text-lg font-bold">Probeer je eerste browsergesprek</h3>
                <p className="mt-4 text-sm leading-6">Start hier een browsergesprek om de agent te horen, het transcript te bekijken en de workflow te valideren voordat je verder aanpast.</p>
                <div className="mt-6 text-right"><button onClick={() => setFirstCallTip(false)} className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-600">Sluiten</button></div>
              </div>
            )}
          </aside>
          )}
      </div>
    </div>
  );
}

function WorkflowVersionsSidePanel({
  agent,
  unsaved,
  onSaveDraft,
  onPublish,
  onShowTest,
  onClose,
}: {
  agent: any;
  unsaved: boolean;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onShowTest: () => void;
  onClose: () => void;
}) {
  const [busyAction, setBusyAction] = useState<'draft' | 'publish' | null>(null);
  const statusLabel = agent.status === 'published' ? 'Gepubliceerd' : 'Concept';

  async function runAction(action: 'draft' | 'publish') {
    setBusyAction(action);
    try {
      if (action === 'draft') {
        await onSaveDraft();
      } else {
        await onPublish();
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#202020] dark:bg-[#050505]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-[#202020]">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">Workflowversies</h2>
          <p className={`truncate text-xs ${voicePageMuted}`}>Beheer concepten en gepubliceerde wijzigingen.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300 dark:hover:bg-[#202020] dark:hover:text-white"
          aria-label="Workflowversies sluiten"
          title="Workflowversies sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">v1</p>
                <p className={`mt-1 text-xs ${voicePageMuted}`}>Huidige productieworkflow</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                {statusLabel}
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-200">
              {unsaved ? 'Er zijn niet-opgeslagen workflowwijzigingen.' : 'Er zijn geen niet-opgeslagen workflowwijzigingen.'}
            </div>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Beschikbare acties</p>
            <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>
              Opslaan bewaart de workflow als concept. Publiceren maakt de huidige workflow actief voor deze agent.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <VoiceButton
                variant="ghost"
                onClick={() => runAction('draft')}
                disabled={busyAction !== null}
                className="justify-center"
              >
                {busyAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Concept opslaan
              </VoiceButton>
              <VoiceButton
                onClick={() => runAction('publish')}
                disabled={busyAction !== null}
                className="justify-center"
              >
                {busyAction === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                v1 publiceren
              </VoiceButton>
            </div>
          </div>

          <VoiceButton variant="ghost" onClick={onShowTest} className="w-full justify-center">
            <Bot className="h-4 w-4" /> Terug naar testpaneel
          </VoiceButton>
        </div>
      </div>
    </div>
  );
}

function PhoneCallSidePanel({
  agent,
  onRun,
  onShowTest,
  onClose,
}: {
  agent: any;
  onRun: () => void;
  onShowTest: () => void;
  onClose: () => void;
}) {
  const callMode = (agent.channelMode || agent.channel_mode || 'whatsapp_voice').toString().replace(/_/g, ' ');
  const isOutbound = ['outbound', 'both'].includes(String(agent.callType || agent.call_type || '').toLowerCase());
  const isInbound = !agent.callType || ['inbound', 'both'].includes(String(agent.callType || agent.call_type || 'inbound').toLowerCase());

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#202020] dark:bg-[#050505]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-[#202020]">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">Telefoongesprek</h2>
          <p className={`truncate text-xs ${voicePageMuted}`}>Configureer en test dit belkanaal.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300 dark:hover:bg-[#202020] dark:hover:text-white"
          aria-label="Belinstellingen sluiten"
          title="Belinstellingen sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">Browsergesprek</p>
                <p className={`mt-1 text-sm leading-6 ${voicePageMuted}`}>
                  Draai eerst een browsergesprek voordat je een echt telefoonnummer koppelt.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                Klaar
              </span>
            </div>
            <VoiceButton onClick={onRun} className="mt-4 w-full justify-center">
              <Phone className="h-4 w-4" /> Browsergesprek starten
            </VoiceButton>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Belroutering</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Mode</span>
                <span className="truncate capitalize font-semibold">{callMode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Inkomende gesprekken</span>
                <span className={isInbound ? 'font-semibold text-emerald-600 dark:text-emerald-300' : 'font-semibold text-zinc-500'}>{isInbound ? 'Ingeschakeld' : 'Uit'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Uitgaande gesprekken</span>
                <span className={isOutbound ? 'font-semibold text-emerald-600 dark:text-emerald-300' : 'font-semibold text-zinc-500'}>{isOutbound ? 'Ingeschakeld' : 'Uit'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/voice/telephony?agentId=${agent.id}`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-[hsl(240_1.7%_11.2%)] transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424]"
            >
              <Settings2 className="h-4 w-4" /> Telefonie
            </Link>
            <VoiceButton variant="ghost" onClick={onShowTest} className="justify-center">
              <Bot className="h-4 w-4" /> Testpaneel
            </VoiceButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreWorkflowActionsSidePanel({
  unsaved,
  validation,
  onAddNode,
  onSaveDraft,
  onPublish,
  onShowVersions,
  onShowOptions,
  onShowPhone,
  onShowTest,
  onClose,
}: {
  unsaved: boolean;
  validation: WorkflowValidation;
  onAddNode: (kind?: AddableFlowNodeKind) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onShowVersions: () => void;
  onShowOptions: () => void;
  onShowPhone: () => void;
  onShowTest: () => void;
  onClose: () => void;
}) {
  const [busyAction, setBusyAction] = useState<'draft' | 'publish' | null>(null);
  const saveDisabled = !validation.valid || busyAction !== null;

  async function runAction(action: 'draft' | 'publish') {
    setBusyAction(action);
    try {
      if (action === 'draft') {
        await onSaveDraft();
      } else {
        await onPublish();
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#202020] dark:bg-[#050505]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-[#202020]">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">Meer acties</h2>
          <p className={`truncate text-xs ${voicePageMuted}`}>Snelle workflowacties.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300 dark:hover:bg-[#202020] dark:hover:text-white"
          aria-label="Meer acties sluiten"
          title="Meer acties sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">Workflowstatus</p>
                <p className={`mt-1 text-sm leading-6 ${voicePageMuted}`}>
                  {unsaved ? 'Je hebt wijzigingen die nog opgeslagen moeten worden.' : 'Alles is momenteel opgeslagen.'}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${unsaved ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'}`}>
                {unsaved ? 'Niet opgeslagen' : 'Opgeslagen'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(workflowModuleTemplates) as Array<[AddableFlowNodeKind, typeof workflowModuleTemplates[AddableFlowNodeKind]]>).map(([kind, template]) => {
              const Icon = template.icon;
              return (
                <VoiceButton key={kind} variant="ghost" onClick={() => onAddNode(kind)} className="justify-center">
                  <Icon className="h-4 w-4" /> {template.shortLabel}
                </VoiceButton>
              );
            })}
            <VoiceButton variant="ghost" onClick={onShowTest} className="justify-center">
              <Bot className="h-4 w-4" /> Testpaneel
            </VoiceButton>
            <VoiceButton variant="ghost" onClick={onShowVersions} className="justify-center">
              <RefreshCw className="h-4 w-4" /> Versies
            </VoiceButton>
            <VoiceButton variant="ghost" onClick={onShowOptions} className="justify-center">
              <Settings2 className="h-4 w-4" /> Opties
            </VoiceButton>
            <VoiceButton variant="ghost" onClick={onShowPhone} className="justify-center">
              <Phone className="h-4 w-4" /> Bellen
            </VoiceButton>
            <Link
              href="/voice/reports"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-[hsl(240_1.7%_11.2%)] transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424]"
            >
              <BarChart3 className="h-4 w-4" /> Rapporten
            </Link>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Workflowcontrole</p>
            <div className="mt-3 space-y-2 text-sm">
              {validation.errors.length === 0 ? (
                <p className="text-emerald-600 dark:text-emerald-300">De flow is klaar om op te slaan en te publiceren.</p>
              ) : validation.errors.map((error) => (
                <p key={error} className="text-rose-600 dark:text-rose-300">{error}</p>
              ))}
              {validation.warnings.map((warning) => (
                <p key={warning} className="text-amber-700 dark:text-amber-200">{warning}</p>
              ))}
            </div>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Opslaan en publiceren</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <VoiceButton
                variant="ghost"
                onClick={() => runAction('draft')}
                disabled={saveDisabled}
                title={validation.valid ? 'Concept opslaan' : validation.errors[0]}
                className="justify-center"
              >
                {busyAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Concept opslaan
              </VoiceButton>
              <VoiceButton
                onClick={() => runAction('publish')}
                disabled={saveDisabled}
                title={validation.valid ? 'Publiceren' : validation.errors[0]}
                className="justify-center"
              >
                {busyAction === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Publiceren
              </VoiceButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowOptionsSidePanel({
  agent,
  nodes,
  unsaved,
  validation,
  onAddNode,
  onShowTest,
  onClose,
}: {
  agent: any;
  nodes: FlowNode[];
  unsaved: boolean;
  validation: WorkflowValidation;
  onAddNode: (kind?: AddableFlowNodeKind) => void;
  onShowTest: () => void;
  onClose: () => void;
}) {
  const moduleNodes = nodes.filter(isWorkflowModuleNode);
  const agentNodeCount = moduleNodes.filter((node) => node.kind === 'agent').length;
  const workflowStatus = unsaved ? 'Niet opgeslagen' : 'Gepubliceerd';
  const channelMode = (agent.channelMode || agent.channel_mode || 'whatsapp_voice').toString().replace(/_/g, ' ');

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#202020] dark:bg-[#050505]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-[#202020]">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">Workflowopties</h2>
          <p className={`truncate text-xs ${voicePageMuted}`}>Beheer dit canvas en testpaneel.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300 dark:hover:bg-[#202020] dark:hover:text-white"
          aria-label="Workflowopties sluiten"
          title="Workflowopties sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Status</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={`block text-xs ${voicePageMuted}`}>Versie</span>
                <span className="font-semibold">v1</span>
              </div>
              <div>
                <span className={`block text-xs ${voicePageMuted}`}>Status</span>
                <span className={unsaved ? 'font-semibold text-amber-600 dark:text-amber-300' : 'font-semibold text-emerald-600 dark:text-emerald-300'}>{workflowStatus}</span>
              </div>
              <div>
                <span className={`block text-xs ${voicePageMuted}`}>Nodes</span>
                <span className="font-semibold">{nodes.length}</span>
              </div>
              <div>
                <span className={`block text-xs ${voicePageMuted}`}>Modules</span>
                <span className="font-semibold">{moduleNodes.length}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Modules toevoegen</p>
            <p className={`mt-1 text-sm leading-6 ${voicePageMuted}`}>Bouw de flow uit met gesprekslogica, vragenblokken of externe acties.</p>
            <div className="mt-4 grid gap-2">
              {(Object.entries(workflowModuleTemplates) as Array<[AddableFlowNodeKind, typeof workflowModuleTemplates[AddableFlowNodeKind]]>).map(([kind, template]) => {
                const Icon = template.icon;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => onAddNode(kind)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-left text-sm transition hover:bg-zinc-50 dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-[#343434] dark:bg-[#111] dark:text-zinc-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{template.label}</span>
                        <span className={`block truncate text-xs ${voicePageMuted}`}>{template.badge}</span>
                      </span>
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-zinc-500" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Workflowcontrole</p>
            <div className="mt-3 space-y-2 text-sm">
              {validation.errors.length === 0 ? (
                <p className="text-emerald-600 dark:text-emerald-300">Geen blokkades gevonden.</p>
              ) : validation.errors.map((error) => (
                <p key={error} className="text-rose-600 dark:text-rose-300">{error}</p>
              ))}
              {validation.warnings.map((warning) => (
                <p key={warning} className="text-amber-700 dark:text-amber-200">{warning}</p>
              ))}
            </div>
          </div>

          <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
            <p className="text-sm font-bold">Agent</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Naam</span>
                <span className="truncate font-semibold">{agent.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Mode</span>
                <span className="truncate capitalize">{channelMode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={voicePageMuted}>Agentstappen</span>
                <span className="font-semibold">{agentNodeCount}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <VoiceButton variant="ghost" onClick={() => onAddNode('agent')} className="justify-center">
              <Plus className="h-4 w-4" /> Agentstap
            </VoiceButton>
            <VoiceButton variant="ghost" onClick={onShowTest} className="justify-center">
              <Bot className="h-4 w-4" /> Testpaneel
            </VoiceButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestAgentSidePanel({
  testMode,
  setTestMode,
  testRunning,
  testEnded,
  testTranscript,
  runtimeSession,
  onRun,
  onClose,
}: {
  testMode: 'audio' | 'chat';
  setTestMode: (mode: 'audio' | 'chat') => void;
  testRunning: boolean;
  testEnded: boolean;
  testTranscript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  runtimeSession: any;
  onRun: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-5 text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        aria-label="Testpaneel sluiten"
        title="Testpaneel sluiten"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="mb-8 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 dark:bg-[#171717]">
        <button onClick={() => setTestMode('audio')} className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'audio' ? 'bg-white text-zinc-950 shadow-sm dark:bg-[#2b2b2b] dark:text-white dark:shadow-inner' : 'text-zinc-500 dark:text-zinc-400'}`}>
          <Mic className="mr-2 inline h-4 w-4" /> Audio testen
        </button>
        <button onClick={() => setTestMode('chat')} className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'chat' ? 'bg-white text-zinc-950 shadow-sm dark:bg-[#2b2b2b] dark:text-white dark:shadow-inner' : 'text-zinc-500 dark:text-zinc-400'}`}>
          <MessageSquare className="mr-2 inline h-4 w-4" /> Chat testen
        </button>
      </div>
      <div className="flex h-[calc(100%-4rem)] flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-[#202020] dark:bg-[#050505]">
        {!testRunning && !testEnded ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-200"><Phone className="h-6 w-6" /></div>
            <h2 className="font-bold">Bel deze agent in de browser</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Test de agent via een spraakgesprek. Sommige telefonietools, zoals doorverbinden, worden hier nog niet ondersteund.</p>
            <VoiceButton onClick={onRun} className="mt-6"><Phone className="h-4 w-4" /> Test starten</VoiceButton>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold"><MessageSquare className="mr-2 inline h-4 w-4" /> Live transcript</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${testEnded ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>{testEnded ? 'Beeindigd' : 'Live'}</span>
            </div>
            <div className="mb-6 flex justify-center"><span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-xs text-blue-700 dark:text-blue-300">gesprek starten</span></div>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              {runtimeSession?.session?.roomName ? `Ruimte: ${runtimeSession.session.roomName}` : 'Runtime-sessie voorbereiden...'}
            </p>
            <div className="space-y-3 overflow-auto pr-1">
              {testTranscript.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-xl border p-4 text-sm ${
                  message.role === 'assistant'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100'
                    : message.role === 'user'
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-100'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-[#202020] dark:text-zinc-300'
                }`}>
                  <span className="mb-1 block text-[11px] uppercase tracking-wide text-zinc-500">{message.role}</span>
                  {message.content}
                </div>
              ))}
              {testTranscript.length === 0 && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-500 dark:bg-[#202020] dark:text-zinc-200">
                  Hoi, ik ben je AI-spraakagent. Waarmee kan ik je vandaag helpen?
                </div>
              )}
              <p className="mt-3 text-xs italic text-zinc-500">{testEnded ? 'afgerond' : 'aan het spreken...'}</p>
            </div>
            <div className="mt-auto">
              <p className="mb-4 text-center text-sm font-semibold text-emerald-400">{testEnded ? 'Beëindigd' : 'Verbonden'}</p>
              <button onClick={onRun} className={`w-full rounded-md px-4 py-3 text-sm font-semibold ${testEnded ? 'bg-zinc-200 text-zinc-900' : 'bg-red-500/80 text-white'}`}>
                {testEnded ? <RefreshCw className="mr-2 inline h-4 w-4" /> : <Phone className="mr-2 inline h-4 w-4" />}
                {testEnded ? 'Start nieuwe test' : 'Gesprek beëindigen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function NodeSidePanel({ node, onBack, onSave }: { node: FlowNode; onBack: () => void; onSave: (node: FlowNode) => void }) {
  const [draft, setDraft] = useState(node);

  useEffect(() => {
    setDraft(node);
  }, [node]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#202020] dark:bg-[#050505]">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 px-4 dark:border-[#202020]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300 dark:hover:bg-[#202020] dark:hover:text-white"
          aria-label="Terug naar testpaneel"
          title="Terug"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">Bewerk {node.title}</h2>
          <p className={`truncate text-xs ${voicePageMuted}`}>Configureer deze workflowstap.</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-5">
          <VoiceField label="Naam *" help="Korte naam die zichtbaar is in canvas en gesprekslogs.">
            <Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClass} />
          </VoiceField>
          <VoiceField label="Begroetingstype" help="Of de optionele begroeting via TTS wordt uitgesproken of vanuit een vooraf opgenomen audiobestand wordt afgespeeld.">
            <NativeSelect value={draft.greetingType || 'tts'} onChange={(value) => setDraft({ ...draft, greetingType: value })}><option value="tts">Tekst (TTS)</option><option value="audio">Audio-opname</option></NativeSelect>
          </VoiceField>
          <VoiceField label="Begroetingstekst" help="Tekst die via TTS aan het begin van het gesprek wordt uitgesproken. Ondersteunt {{template_variables}}.">
            <Textarea value={draft.greetingText || ''} onChange={(event) => setDraft({ ...draft, greetingText: event.target.value })} rows={3} placeholder="Hoi {{first_name}}, je spreekt met Sarah van Acme." className={inputClass} />
          </VoiceField>
          <VoiceField label="Prompt *" help="Systeemprompt voor deze stap. Ondersteunt {{template_variables}} uit pre-call fetch en initiële context.">
            <Textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} rows={12} className={`${inputClass} font-mono text-sm`} />
          </VoiceField>
          <label className="flex items-start gap-3 text-sm font-semibold">
            <Toggle checked={draft.allowInterruption ?? true} onChange={() => setDraft({ ...draft, allowInterruption: !(draft.allowInterruption ?? true) })} />
            <span>
              Onderbreken toestaan
              <span className="mt-1 block font-normal text-zinc-500">Als dit aan staat, kan de gebruiker de agent midden in een zin onderbreken.</span>
            </span>
          </label>
        </div>
      </div>
      <div className="flex shrink-0 justify-end gap-3 border-t border-zinc-200 p-4 dark:border-[#202020]">
        <VoiceButton variant="ghost" onClick={onBack}>Annuleren</VoiceButton>
        <VoiceButton onClick={() => onSave(draft)}>Node opslaan</VoiceButton>
      </div>
    </div>
  );
}

function KyrnReactFlowNode({ data, selected }: any) {
  const node = data.node as FlowNode;
  const nodeIndex = typeof data.index === 'number' ? data.index + 1 : 0;
  return (
    <div className={`relative w-[300px] rounded-lg border bg-white text-left shadow-xl transition dark:bg-[#171717] ${selected ? 'border-cyan-500 ring-1 ring-cyan-500 dark:border-cyan-400 dark:ring-cyan-400' : 'border-zinc-200 dark:border-[#303030]'}`}>
      {node.kind !== 'start' && <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      {node.kind !== 'end' && <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      {isWorkflowModuleNode(node) && <Handle type="target" position={Position.Left} id="left" className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-[#2b2b2b]">
        <span className={`mb-2 inline-flex rounded px-2 py-1 text-[10px] font-semibold ${nodeTone[node.kind]}`}>{node.badge}</span>
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{node.title} <span className="ml-1 text-xs text-zinc-500">#{nodeIndex}</span></h3>
      </div>
      <div className="px-4 py-4">
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Prompt:</p>
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-zinc-700 dark:text-zinc-200">{node.prompt}</p>
      </div>
      {selected && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            data.onEdit(node);
          }}
          className="nodrag absolute -right-12 top-20 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1f1f1f] dark:text-zinc-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function KyrnReactFlowEdge(props: any) {
  const { resolvedTheme } = useTheme();
  const edgeStroke = resolvedTheme === 'dark' ? '#8792a5' : '#94a3b8';
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 8,
    offset: 20,
  });

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: edgeStroke, strokeWidth: 2, strokeDasharray: '5 6' }} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute rounded-full bg-amber-500 px-3 py-1 text-[10px] font-semibold text-black"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {props.data?.label || 'Doorgaan'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function WorkflowNode({ node, selected, onSelect, onEdit }: { node: FlowNode; selected: boolean; onSelect: () => void; onEdit: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`absolute w-[300px] rounded-lg border bg-white text-left shadow-xl transition dark:bg-[#171717] ${selected ? 'border-cyan-500 ring-1 ring-cyan-500 dark:border-cyan-400 dark:ring-cyan-400' : 'border-zinc-200 dark:border-[#303030]'}`}
      style={{ left: node.x, top: node.y }}
    >
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-[#2b2b2b]">
        <span className={`mb-2 inline-flex rounded px-2 py-1 text-[10px] font-semibold ${nodeTone[node.kind]}`}>{node.badge}</span>
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{node.title} <span className="ml-1 text-xs text-zinc-500">#{nodeSeeds.findIndex((item) => item.id === node.id)}</span></h3>
      </div>
      <div className="px-4 py-4">
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Prompt:</p>
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-zinc-700 dark:text-zinc-200">{node.prompt}</p>
      </div>
      {selected && (
        <span onClick={(event) => { event.stopPropagation(); onEdit(); }} className="absolute -right-12 top-20 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1f1f1f] dark:text-zinc-200">
          <Pencil className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}

function EdgeLabel({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <span className="absolute rounded-full bg-amber-500 px-3 py-1 text-[10px] font-semibold text-black" style={{ left: x, top: y }}>
      {children}
    </span>
  );
}

function AgentUploadDialog({ busy, onClose, onCreate }: { busy: boolean; onClose: () => void; onCreate: (agentDefinition: Record<string, any>) => Promise<void> }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const workflow = parsed.workflow_definition || parsed.workflowJson || parsed;
      if (!workflow.nodes || !workflow.edges) {
        throw new Error('Ongeldige workflowstructuur');
      }
      await onCreate({
        name: parsed.name || `WF-${Date.now()}`,
        description: 'Geïmporteerd vanuit een Dograh-compatible agentdefinitie.',
        systemPrompt: extractPromptFromWorkflow(workflow),
        channelMode: 'whatsapp_voice',
        isDefaultForWhatsapp: true,
        metadata: {
          importedFrom: 'dograh_json',
          workflowDefinition: workflow,
        },
      });
    } catch {
      setError('Workflow uploaden mislukt. Controleer of het JSON-bestand geldig is.');
    }
  }

  return (
    <SmallDialog title="Agentdefinitie uploaden" description="Sleep een Dograh-compatible Workflow JSON-bestand hierheen of klik om te kiezen." onClose={onClose}>
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${dragging ? 'border-cyan-400 bg-cyan-400/5' : 'border-[#3a3a3a]'}`}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
      >
        <Upload className="mx-auto mb-4 h-8 w-8 text-zinc-400" />
        <p className="mb-4 text-sm text-zinc-400">Sleep je Workflow JSON-bestand hierheen of klik om te kiezen</p>
        <input
          id="workflow-upload"
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <VoiceButton variant="ghost" onClick={() => document.getElementById('workflow-upload')?.click()} disabled={busy}>Bestand kiezen</VoiceButton>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </SmallDialog>
  );
}

function FolderDialog({ form, setForm, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Nieuwe map maken" description="Groepeer actieve spraakagents in een map, volgens de workflow-organisatie van Dograh." onClose={onClose}>
      <VoiceField label="Mapnaam">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="bijv. Salesagents" className={inputClass} />
      </VoiceField>
      <DialogActions busy={false} onClose={onClose} onCreate={onCreate} createLabel="Map maken" disabled={!form.name} />
    </SmallDialog>
  );
}

function AgentCreateDialog({ step, error, form, setForm, onClose, onCreate, onOpen }: any) {
  if (step === 'creating') {
    return (
      <ModalShell>
        <div className={`w-[448px] max-w-[calc(100vw-32px)] rounded-2xl p-10 text-center shadow-2xl ${voicePanelClass}`}>
          <Loader2 className="mx-auto mb-8 h-16 w-16 animate-spin text-cyan-500 dark:text-zinc-200" />
          <h2 className="text-lg font-bold">Je workflow wordt gemaakt</h2>
          <p className={`mx-auto mt-4 max-w-xs text-sm leading-6 ${voicePageMuted}`}>We zetten je spraakagent op met jouw instellingen. Dit duurt heel even...</p>
        </div>
      </ModalShell>
    );
  }
  if (step === 'success') {
    return (
      <ModalShell>
        <div className={`relative w-[512px] max-w-[calc(100vw-32px)] rounded-2xl p-6 shadow-2xl ${voicePanelClass}`}>
          <button onClick={onClose} className={`absolute right-4 top-4 ${voicePageMuted}`}><X className="h-4 w-4" /></button>
          <h2 className="flex items-center gap-3 text-lg font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Workflow succesvol gemaakt!</h2>
          <div className={`mt-6 space-y-4 text-sm leading-6 ${voicePageMuted}`}>
            <p>Er is een spraakagent-workflow gemaakt voor je use-case, met voorbeeldacties en bewerkbare workflownodes.</p>
            <p>De voicebot is ingesteld om duidelijk te communiceren en werkt voor WhatsApp of losse spraakgesprekken.</p>
            <p>Volgende stap: test de voicebot in de editor en pas hem daarna aan op je proces.</p>
          </div>
          <VoiceButton onClick={onOpen} className="mt-8 w-full justify-center">Agent openen en testen</VoiceButton>
        </div>
      </ModalShell>
    );
  }
  return (
    <ModalShell>
      <div className="w-full max-w-[680px] px-4">
          <div className={`relative rounded-2xl p-6 shadow-2xl ${voicePanelClass}`}>
            <button onClick={onClose} className={`absolute right-6 top-6 ${voicePageMuted}`}><X className="h-4 w-4" /></button>
            <h1 className="text-2xl font-bold">Spraakagent maken</h1>
            <p className={`mt-2 text-sm ${voicePageMuted}`}>Vertel waar je de agent voor gebruikt en Kyrn maakt een herbruikbare workflow voor gesprekken en WhatsApp.</p>
            <div className="mt-6 space-y-6">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}
              <VoiceField label="Gesprekstype" help="Kies of gebruikers je AI bellen of dat je AI gebruikers belt">
                <NativeSelect value={form.callType} onChange={(value) => setForm({ ...form, callType: value })}>
                  <option value="inbound">Inkomend (gebruikers bellen AI)</option>
                  <option value="outbound">Uitgaand (AI belt gebruikers)</option>
                  <option value="both">Inkomend en uitgaand</option>
                </NativeSelect>
              </VoiceField>
              <VoiceField label="Use-case" help="Beschrijf het belangrijkste doel van je spraakagent">
                <Input value={form.useCase} onChange={(event) => setForm({ ...form, useCase: event.target.value })} placeholder="bijv. afspraken plannen" className={inputClass} />
              </VoiceField>
              <VoiceField label="Activiteitsbeschrijving" help="Deze beschrijving wordt gebruikt om de AI-prompt voor je spraakagent te genereren">
                <Textarea value={form.activityDescription} onChange={(event) => setForm({ ...form, activityDescription: event.target.value })} rows={5} placeholder="Beschrijf wat deze agent moet doen..." className={inputClass} />
              </VoiceField>
              <VoiceButton onClick={onCreate} disabled={!form.useCase || !form.activityDescription} className="w-full justify-center">Agent maken</VoiceButton>
            </div>
          </div>
        </div>
    </ModalShell>
  );
}

function TelephonyDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Telefonieconfiguratie toevoegen" description="Koppel een telefonieprovider. Telefoonnummers voeg je toe nadat de configuratie is gemaakt." onClose={onClose}>
      <VoiceField label="Naam">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="bijv. Twilio NL productie" className={inputClass} />
      </VoiceField>
      <VoiceField label="Provider">
        <NativeSelect value={form.provider} onChange={(value) => setForm({ ...form, provider: value })}>
          <option value="twilio">Twilio</option>
          <option value="asterisk_ari">Asterisk ARI</option>
          <option value="sip">SIP-provider</option>
        </NativeSelect>
      </VoiceField>
      <div className="rounded-md border border-[#303030] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Instellen als standaard voor uitgaande gesprekken</p>
            <p className="text-xs text-zinc-500">Gebruikt door testgesprekken en campagnes wanneer geen specifieke configuratie is gekozen.</p>
          </div>
          <Toggle checked={form.isDefaultOutbound} onChange={() => setForm({ ...form, isDefaultOutbound: !form.isDefaultOutbound })} />
        </div>
      </div>
      <VoiceField label={form.provider === 'asterisk_ari' ? 'ARI Endpoint' : 'Account SID'}>
        <Input value={form.provider === 'asterisk_ari' ? form.endpoint : form.accountSid} onChange={(event) => setForm(form.provider === 'asterisk_ari' ? { ...form, endpoint: event.target.value } : { ...form, accountSid: event.target.value })} className={inputClass} />
      </VoiceField>
      <VoiceField label={form.provider === 'asterisk_ari' ? 'ARI Password' : 'Auth Token'}>
        <Input value={form.authToken} onChange={(event) => setForm({ ...form, authToken: event.target.value })} type="password" className={inputClass} />
      </VoiceField>
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Maken" disabled={!form.name} />
    </SmallDialog>
  );
}

function ToolDialog({ form, setForm, busy, onClose, onCreate }: any) {
  const canCreateTool = Boolean(
    form.name &&
      (form.category === 'http_api'
        ? form.endpoint
        : form.category === 'transfer_call'
          ? form.transferNumber
          : form.category === 'calculator'
            ? form.expression
            : true)
  );

  return (
    <SmallDialog title="Nieuwe tool maken" description="Maak een nieuwe tool die in je workflows gebruikt kan worden." onClose={onClose}>
      <VoiceField label="Tooltype" help="Doe HTTP-verzoeken naar externe API’s">
        <NativeSelect value={form.category} onChange={(value) => setForm({ ...form, category: value })}>
          <option value="http_api">Externe HTTP API</option>
          <option value="end_call">Gesprek beëindigen</option>
          <option value="transfer_call">Gesprek doorverbinden</option>
          <option value="calculator">Rekenmachine</option>
        </NativeSelect>
      </VoiceField>
      <VoiceField label="Toolnaam" help='Gebruik een duidelijke naam, zoals "Afspraak boeken".'>
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="bijv. Afspraak boeken, Voorraad controleren" className={inputClass} />
      </VoiceField>
      <VoiceField label="Beschrijving (optioneel)" help="Geef een beschrijving waardoor het LLM begrijpt wat deze tool doet">
        <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Wat doet deze tool?" className={inputClass} />
      </VoiceField>
      {form.category === 'http_api' && (
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <VoiceField label="Method">
            <NativeSelect value={form.method} onChange={(value) => setForm({ ...form, method: value })} className="w-full">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </NativeSelect>
          </VoiceField>
          <VoiceField label="Endpoint URL">
            <Input value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} placeholder="https://api.example.com/bookings" className={inputClass} />
          </VoiceField>
        </div>
      )}
      {form.category === 'transfer_call' && (
        <VoiceField label="Doorverbindnummer" help="Het telefoonnummer of SIP-doel waarnaar de beller wordt doorverbonden.">
          <Input value={form.transferNumber} onChange={(event) => setForm({ ...form, transferNumber: event.target.value })} placeholder="+31..." className={inputClass} />
        </VoiceField>
      )}
      {form.category === 'calculator' && (
        <VoiceField label="Standaardexpressie" help="Agents kunnen dit tijdens uitvoering overschrijven met live variabelen.">
          <Input value={form.expression} onChange={(event) => setForm({ ...form, expression: event.target.value })} placeholder="subtotal * 1.21" className={inputClass} />
        </VoiceField>
      )}
      {form.category === 'end_call' && (
        <div className={`rounded-xl p-4 text-sm leading-6 ${voiceSoftPanelClass} ${voicePageMuted}`}>
          Met deze ingebouwde actie kan de agent het gesprek afsluiten na een korte samenvatting of afscheidsbericht.
        </div>
      )}
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Tool maken" disabled={!canCreateTool} />
    </SmallDialog>
  );
}

function FileDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Document uploaden" description="Upload een PDF of document om toe te voegen aan je kennisbank" onClose={onClose}>
      <DropZone title="Sleep je document hierheen" subtitle="Ondersteunde formaten: .pdf, .docx, .doc, .txt, .json (max 5MB)" />
      <VoiceField label="Documentnaam">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Bestand kiezen" className={inputClass} />
      </VoiceField>
      <VoiceField label="Uitgelezen tekst">
        <Textarea value={form.contentText} onChange={(event) => setForm({ ...form, contentText: event.target.value })} rows={4} placeholder="Optionele documenttekst voor retrieval..." className={inputClass} />
      </VoiceField>
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Document uploaden" disabled={!form.name} />
    </SmallDialog>
  );
}

function RecordingDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Opnames uploaden" description="Upload of neem audiobestanden op. Gebruik @ in promptvelden om ze in agents in te voegen." onClose={onClose}>
      <VoiceField label="Audiobestanden">
        <div className="flex gap-2">
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Kies audiobestanden (max 5MB per bestand)" className={inputClass} />
          <VoiceButton variant="ghost"><Mic className="h-4 w-4" /> Opnemen</VoiceButton>
        </div>
      </VoiceField>
      <VoiceField label="Taal">
        <NativeSelect value={form.language} onChange={(value) => setForm({ ...form, language: value })}>
          <option value="auto">Meertalig (automatisch detecteren)</option>
          <option value="nl">Nederlands</option>
          <option value="en">Engels</option>
        </NativeSelect>
      </VoiceField>
      <VoiceField label="Transcript">
        <Textarea value={form.transcript} onChange={(event) => setForm({ ...form, transcript: event.target.value })} rows={3} className={inputClass} />
      </VoiceField>
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Opname uploaden" disabled={!form.name} />
    </SmallDialog>
  );
}

function PageTopbar({ actions }: { actions?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-end gap-3 border-b border-zinc-200 bg-[#f8f8f7] px-4 dark:border-[#252525] dark:bg-[#050505]">
      {actions}
    </div>
  );
}

function SectionPage({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <PageTopbar />
      <section className="mx-auto max-w-[1488px] px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-3 max-w-5xl text-zinc-500">{description}</p>
          </div>
          {action}
        </div>
        <div className="space-y-6">{children}</div>
      </section>
    </div>
  );
}

function VoiceNotice({ notice, onClose }: { notice: { type: 'ok' | 'error' | 'info'; message: string } | null; onClose: () => void }) {
  if (!notice) return null;

  const styles = notice.type === 'ok'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
    : notice.type === 'error'
      ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'
      : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';

  return (
    <div className="pointer-events-none fixed right-5 top-16 z-50 w-[min(420px,calc(100vw-32px))]">
      <div className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${styles}`}>
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1">{notice.message}</span>
        <button type="button" onClick={onClose} className="shrink-0 opacity-70 transition hover:opacity-100" aria-label="Melding sluiten">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CenteredPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full px-6 py-10">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">{children}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg p-6 ${voicePanelClass}`}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {subtitle && <p className={`mt-1 text-sm ${voicePageMuted}`}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function EmptyBlock({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="py-2">
      <h2 className={`text-xl font-bold ${voicePageText}`}>{title}</h2>
      <p className={`mt-2 text-sm ${voicePageMuted}`}>{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

function VoiceField({ label, help, className, children }: { label: string; help?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className || ''}`}>
      <span className={`mb-2 block text-sm font-bold ${voicePageText}`}>{label}</span>
      {children}
      {help && <span className={`mt-2 block text-sm ${voicePageMuted}`}>{help}</span>}
    </label>
  );
}

function NativeSelect({ value, onChange, children, className }: { value: string; onChange: (value: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-[hsl(240_1.7%_11.2%)] outline-none focus:border-cyan-500 dark:border-[#3a3a3a] dark:bg-[#222] dark:text-white ${className || ''}`}>
      {children}
    </select>
  );
}

function VoiceButton({ children, variant = 'primary', className = '', ...props }: any) {
  const styles = variant === 'ghost'
    ? 'border border-zinc-200 bg-white text-[hsl(240_1.7%_11.2%)] hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424]'
    : variant === 'light'
      ? 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424]'
      : 'bg-[hsl(240_1.7%_11.2%)] text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:disabled:bg-zinc-500 dark:disabled:text-zinc-900';
  return (
    <Button {...props} className={`h-9 gap-2 rounded-md px-4 text-sm font-semibold ${styles} ${className}`}>
      {children}
    </Button>
  );
}

function Toggle({ checked, onChange, ariaLabel = 'Instelling schakelen' }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-cyan-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  );
}

function ModalShell({ children, plain = false }: { children: React.ReactNode; plain?: boolean }) {
  return (
    <div className={`fixed inset-0 z-50 ${plain ? 'bg-[#050505]' : 'flex items-center justify-center bg-black/75 backdrop-blur-md'}`}>
      {children}
    </div>
  );
}

function SmallDialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <ModalShell>
      <div className={`relative w-[512px] max-w-[calc(100vw-32px)] rounded-lg p-6 shadow-2xl ${voicePanelClass}`}>
        <button onClick={onClose} className={`absolute right-4 top-4 ${voicePageMuted}`}><X className="h-4 w-4" /></button>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>{description}</p>
        <div className="mt-8 space-y-5">{children}</div>
      </div>
    </ModalShell>
  );
}

function DialogActions({ busy, onClose, onCreate, createLabel, disabled }: any) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <VoiceButton variant="ghost" onClick={onClose}>Annuleren</VoiceButton>
      <VoiceButton onClick={onCreate} disabled={busy || disabled}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{createLabel}</VoiceButton>
    </div>
  );
}

function DropZone({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 text-center dark:border-[#3a3a3a]">
      <Upload className={`mb-5 h-10 w-10 ${voicePageMuted}`} />
      <h3 className="text-lg font-bold">{title}</h3>
      <p className={`mt-2 text-sm ${voicePageMuted}`}>or click to browse</p>
      <p className={`mt-5 text-xs ${voicePageMuted}`}>{subtitle}</p>
    </div>
  );
}

function SearchRow({ placeholder, className }: { placeholder: string; className?: string }) {
  return (
    <div className={`flex h-9 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-500 dark:border-[#2f2f2f] dark:bg-[#101010] ${className || ''}`}>
      <Search className="h-4 w-4" />
      {placeholder}
    </div>
  );
}

function RecordList({ rows, detail }: { rows: any[]; detail: (row: any) => string }) {
  return (
    <div className="mt-5 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-[#2b2b2b] dark:border-[#2b2b2b]">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="font-semibold">{row.name || row.agentName || `#${row.id}`}</p>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>{detail(row)}</p>
          </div>
          <Badge variant="outline" className="border-zinc-200 text-zinc-700 dark:border-[#343434] dark:text-zinc-300">{row.status || row.processingStatus || 'active'}</Badge>
        </div>
      ))}
    </div>
  );
}

function DeveloperKeyPanel({ title, subtitle, keys, button, prefix }: any) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="mb-5 flex justify-end gap-2">
        <VoiceButton variant="ghost"><EyeOff className="h-4 w-4" /> Archief tonen</VoiceButton>
        <VoiceButton><Plus className="h-4 w-4" /> {button}</VoiceButton>
      </div>
      <div className="space-y-4">
        {(keys.length ? keys : [{ id: 'default', name: 'Standaard API-sleutel', createdAt: new Date().toISOString(), lastUsedAt: null }]).map((key: any) => (
          <div key={key.id} className="rounded-lg border border-zinc-200 p-4 dark:border-[#303030]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{key.name || 'Standaard API-sleutel'}</h3>
                  <Badge className="bg-zinc-100 text-zinc-900">Actief</Badge>
                </div>
                <p className={`mt-3 font-mono text-sm ${voicePageMuted}`}><span className="rounded bg-[#0000170b] px-3 py-2 dark:bg-[#252525]">{prefix}</span> <span className="ml-2 text-xs">(volledige sleutel verborgen voor veiligheid)</span></p>
                <p className={`mt-4 text-xs ${voicePageMuted}`}>Aangemaakt: {formatDate(key.createdAt)} - Laatst gebruikt: {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Nooit'}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricPanel({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="mt-5 text-2xl font-bold">{value}</p>
          <p className={`text-sm ${voicePageMuted}`}>{description}</p>
        </div>
        <Phone className="h-4 w-4 text-zinc-500" />
      </div>
    </Panel>
  );
}

function CampaignStat({ label, value }: { label: string; value: number }) {
  return (
    <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CreditPill({ credits }: { credits?: number }) {
  return (
    <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-[hsl(240_1.7%_11.2%)] shadow-sm dark:border-[#303030] dark:bg-[#151515] dark:text-zinc-300">
      {credits ?? 0} team credits
    </div>
  );
}

function ReadinessRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-sm ${voicePageMuted}`}>{label}</span>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500 dark:bg-[#303030]'}`}>
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </span>
    </div>
  );
}

function ProviderMark({ provider }: { provider: string }) {
  const letter = (provider || 'k').charAt(0).toUpperCase();
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[conic-gradient(from_90deg,#0b5fff,#66e4d5,#e8fbff,#0b5fff)] text-sm font-bold text-white shadow-sm">
      {letter}
    </span>
  );
}

function fallbackProvidersForTab(tab: 'llm' | 'voice' | 'transcriber' | 'embedding') {
  if (tab === 'voice') {
    return [
      { id: 'google-chirp', name: 'Google Chirp 3 HD', description: 'Premium natuurlijke Google-stemmen' },
      { id: 'gemini-tts', name: 'Gemini TTS', description: 'Gemini 3.1 Flash TTS-preview' },
      { id: 'elevenlabs', name: 'ElevenLabs', description: 'Premium stemmen met lage latency' },
      { id: 'minimax', name: 'MiniMax', description: 'Expressieve meertalige TTS' },
      { id: 'qwen', name: 'Qwen TTS', description: 'Realtime voice-stack' },
      { id: 'chatterbox', name: 'Chatterbox', description: 'Open-source stemcloning' },
    ];
  }
  if (tab === 'transcriber') {
    return [
      { id: 'deepgram', name: 'Deepgram', description: 'Snelle streaming STT' },
      { id: 'openai', name: 'ChatGPT transcript', description: 'gpt-realtime-whisper gebruikerstranscripten' },
      { id: 'qwen', name: 'Qwen ASR', description: 'Realtime ASR-slot' },
    ];
  }
  return [
    { id: 'gemini-live', name: 'Gemini 3.1 Flash Live', description: 'Native realtime audio-agentmodel' },
    { id: 'gemini', name: 'Gemini', description: 'Google Gemini tekstfallback' },
    { id: 'openai', name: 'ChatGPT / OpenAI', description: 'gpt-realtime-2 reasoning en realtime fallback' },
    { id: 'qwen', name: 'Qwen', description: 'Realtime en meertalige agentmodellen' },
    { id: 'minimax', name: 'MiniMax', description: 'Modelstack voor spraakagents' },
    { id: 'xiaomi-mimo', name: 'Xiaomi MiMo', description: 'Experimentele providerslot' },
  ];
}

function providerCapability(provider: string, tab: string) {
  if (provider.includes('eleven')) return 'Premium spraaksynthese';
  if (provider.includes('mini')) return 'Meertalige voice- en LLM-provider';
  if (provider.includes('qwen')) return 'Realtime spraak- en LLM-stack';
  if (provider.includes('chatterbox')) return 'Open-source stemcloningservice';
  if (tab === 'embedding') return 'Embeddings voor kennisophaling';
  return 'Configureerbare voice-agentprovider';
}

function modelOptionsForProvider(provider: string, tab: string) {
  if (tab === 'voice') {
    if (provider === 'google-chirp') return ['chirp-3-hd', 'chirp-3-hd-charon', 'chirp-3-hd-kore', 'chirp-3-hd-puck'];
    if (provider === 'gemini-tts') return ['gemini-3.1-flash-tts-preview', 'gemini-2.5-pro-tts-preview'];
    if (provider === 'elevenlabs') return ['eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_flash_v2_5'];
    if (provider === 'minimax') return ['speech-02-hd', 'speech-02-turbo', 'speech-01-turbo'];
    if (provider === 'qwen') return ['qwen-tts-realtime', 'qwen-tts'];
    if (provider === 'chatterbox') return ['chatterbox-multilingual', 'chatterbox-turbo'];
    return ['gpt-4o-mini-tts', 'default'];
  }
  if (tab === 'transcriber') {
    if (provider === 'deepgram') return ['nova-3', 'nova-2', 'base'];
    if (provider === 'qwen') return ['qwen-asr-realtime', 'qwen-asr'];
    if (provider === 'openai') return ['gpt-realtime-whisper', 'gpt-4o-mini-transcribe', 'whisper-1'];
    return ['gpt-realtime-whisper', 'gpt-4o-mini-transcribe', 'whisper-1', 'default'];
  }
  if (tab === 'embedding') return ['text-embedding-3-large', 'text-embedding-3-small', 'qwen-text-embedding'];
  if (provider === 'gemini-live') return ['gemini-3.1-flash-live-preview'];
  if (provider === 'gemini') return ['gemini-3.1-flash', 'gemini-2.5-pro'];
  if (provider === 'qwen') return ['qwen3-235b-a22b', 'qwen3-32b', 'qwen-realtime'];
  if (provider === 'minimax') return ['abab6.5s-chat', 'MiniMax-Text-01'];
  if (provider === 'xiaomi-mimo') return ['mimo-experimental'];
  if (provider === 'openai') return ['gpt-realtime-2', 'gpt-realtime', 'gpt-4o'];
  return ['gpt-realtime-2', 'gpt-realtime', 'gpt-4o'];
}

function fallbackVoices() {
  return [
    { id: 'kyrn-hope', name: 'Hope', provider: 'ElevenLabs', style: 'energiek en helder' },
    { id: 'kyrn-jasper', name: 'Jasper', provider: 'MiniMax', style: 'rustige salesassistent' },
    { id: 'kyrn-nova', name: 'Nova', provider: 'Chatterbox', style: 'gekloonde merkstem' },
  ];
}

function parseCsvRows(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() || '';
      return row;
    }, {});
  });
}

function parseManualLeadRows(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [phone_number = '', first_name = '', context = ''] = splitCsvLine(line).map((part) => part.trim());
      return { phone_number, first_name, context };
    })
    .filter((row) => row.phone_number);
}

function campaignTemplates() {
  return [
    {
      id: 'demo-follow-up',
      name: 'Demo-opvolging',
      description: 'Bel warme leads, bevestig de fit en plan de volgende afspraak.',
      concurrency: 4,
    },
    {
      id: 'reactivation',
      name: 'Heractivatie',
      description: 'Activeer oudere leads opnieuw met een kort gesprek zonder druk.',
      concurrency: 3,
    },
    {
      id: 'appointment-reminder',
      name: 'Afspraakherinnering',
      description: 'Bevestig afspraken en verzamel verzoeken om te verplaatsen.',
      concurrency: 8,
    },
  ];
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function buildAgentPrompt(useCase: string, activityDescription: string, callType: string) {
  return `# HOOFDDOEL IN DEZE STAP
Je bent de Kyrn-spraakagent voor: ${useCase}.

Gesprekstype: ${callType}.

Activiteitsbeschrijving:
${activityDescription}

Begroet de gebruiker natuurlijk, verzamel de belangrijke details, gebruik beschikbare tools en bestanden wanneer nodig, en houd elk antwoord kort genoeg voor een live spraak- of WhatsApp-gesprek.`;
}

function buildWorkflowPayload(agent: any, nodes: FlowNode[]) {
  const startId = nodeIdByKind(nodes, 'start');
  const globalId = nodeIdByKind(nodes, 'global');
  const endId = nodeIdByKind(nodes, 'end');
  const moduleNodes = nodes.filter((node) => isWorkflowModuleNode(node));
  const firstModuleId = moduleNodes[0]?.id || '';
  const lastModuleId = moduleNodes[moduleNodes.length - 1]?.id || '';

  return {
    name: agent.name || 'Kyrn spraakagent',
    version: 1,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: flowKindToWorkflowType(node.kind),
      position: { x: node.x, y: node.y },
      data: {
        name: node.title,
        prompt: node.prompt,
        moduleKind: node.kind,
        allowInterruptions: node.allowInterruption ?? true,
        waitForUserResponse: node.kind === 'agent' || node.kind === 'qa',
      },
    })),
    edges: [
      { id: 'edge-start-module', source: startId, target: firstModuleId, label: 'Naar eerste stap' },
      { id: 'edge-global-module', source: globalId, target: firstModuleId, label: 'Context toepassen' },
      ...moduleNodes.slice(0, -1).map((node, index) => ({
        id: `edge-${node.id}-${moduleNodes[index + 1].id}`,
        source: node.id,
        target: moduleNodes[index + 1].id,
        label: 'Doorgaan',
      })),
      { id: 'edge-module-end', source: lastModuleId, target: endId, label: 'Gesprek beëindigen' },
    ].filter((edge) => edge.source && edge.target),
    variables: {},
    metadata: {
      source: 'kyrn_editor',
      agentId: agent.id,
      savedAt: new Date().toISOString(),
    },
  };
}

function nodeIdByKind(nodes: FlowNode[], kind: FlowNode['kind']) {
  return nodes.find((node) => node.kind === kind)?.id || '';
}

function isWorkflowModuleNode(node: FlowNode): node is FlowNode & { kind: AddableFlowNodeKind } {
  return node.kind === 'agent' || node.kind === 'qa' || node.kind === 'webhook';
}

function validateFlowNodes(nodes: FlowNode[]): WorkflowValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();

  for (const node of nodes) {
    if (ids.has(node.id)) errors.push(`Dubbele node-id gevonden: ${node.id}`);
    ids.add(node.id);
    if (!node.title.trim()) errors.push('Elke node heeft een naam nodig.');
    if (!node.prompt.trim()) errors.push(`${node.title || node.id} heeft nog geen prompt.`);
  }

  const requiredKinds: Array<{ kind: FlowNodeKind; label: string }> = [
    { kind: 'start', label: 'startnode' },
    { kind: 'global', label: 'globale context' },
    { kind: 'end', label: 'eindnode' },
  ];

  for (const required of requiredKinds) {
    const count = nodes.filter((node) => node.kind === required.kind).length;
    if (count !== 1) errors.push(`De workflow heeft precies 1 ${required.label} nodig.`);
  }

  const moduleCount = nodes.filter(isWorkflowModuleNode).length;
  if (moduleCount < 1) errors.push('Voeg minimaal 1 workflowstap toe tussen start en einde.');
  if (!nodes.some((node) => node.kind === 'agent')) warnings.push('Tip: voeg minstens 1 agentstap toe voor natuurlijke gesprekslogica.');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function fallbackNodeForKind(kind: FlowNodeKind, index: number): FlowNode {
  const seeded = nodeSeeds.find((seed) => seed.kind === kind);
  if (seeded) return seeded;
  if (isWorkflowModuleKind(kind)) {
    const template = workflowModuleTemplates[kind];
    return {
      id: `${kind}-${index + 1}`,
      kind,
      title: template.label,
      badge: template.badge,
      prompt: template.prompt,
      x: 720,
      y: 400 + index * 180,
    };
  }
  return nodeSeeds[Math.min(index, nodeSeeds.length - 1)];
}

function isWorkflowModuleKind(kind: FlowNodeKind): kind is AddableFlowNodeKind {
  return kind === 'agent' || kind === 'qa' || kind === 'webhook';
}

function definitionToFlowNodes(definition: any): FlowNode[] {
  const workflowNodes = Array.isArray(definition.nodes) ? definition.nodes : [];
  if (!workflowNodes.length) return nodeSeeds;

  return workflowNodes.map((node: any, index: number) => {
    const kind = workflowTypeToFlowKind(node.type);
    const fallback = fallbackNodeForKind(kind, index);
    return {
      id: node.id || fallback.id,
      kind,
      title: node.data?.name || fallback.title,
      badge: fallback.badge,
      prompt: node.data?.prompt || fallback.prompt,
      allowInterruption: node.data?.allowInterruptions ?? fallback.allowInterruption,
      x: node.position?.x ?? fallback.x,
      y: node.position?.y ?? fallback.y,
    };
  });
}

function flowKindToWorkflowType(kind: FlowNode['kind']) {
  if (kind === 'start') return 'startCall';
  if (kind === 'global') return 'globalNode';
  if (kind === 'qa') return 'qa';
  if (kind === 'webhook') return 'webhook';
  if (kind === 'end') return 'endCall';
  return 'agentNode';
}

function workflowTypeToFlowKind(type: string): FlowNode['kind'] {
  if (type === 'startCall') return 'start';
  if (type === 'globalNode') return 'global';
  if (type === 'qa' || type === 'questionAnswer') return 'qa';
  if (type === 'webhook' || type === 'tool' || type === 'toolCall') return 'webhook';
  if (type === 'endCall') return 'end';
  return 'agent';
}

function extractPromptFromWorkflow(workflow: any) {
  const nodeWithPrompt = Array.isArray(workflow.nodes)
    ? workflow.nodes.find((node: any) => {
        const data = node?.data || {};
        return typeof data.prompt === 'string' || typeof data.systemPrompt === 'string' || typeof data.instructions === 'string';
      })
    : null;
  const data = nodeWithPrompt?.data || {};
  return data.prompt || data.systemPrompt || data.instructions || 'Geïmporteerde Dograh-workflow. Volg de workflowdefinitie en houd antwoorden beknopt.';
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('nl-NL', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const inputClass = 'border-zinc-200 bg-white text-[hsl(240_1.7%_11.2%)] placeholder:text-zinc-400 focus-visible:ring-cyan-500 dark:border-[#3a3a3a] dark:bg-[#222] dark:text-white dark:placeholder:text-zinc-500';
