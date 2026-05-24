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
      { key: 'agents', href: '/voice', label: 'Voice Agents', icon: GitBranch },
      { key: 'campaigns', href: '/voice/campaigns', label: 'Campaigns', icon: Radio },
      { key: 'models', href: '/voice/models', label: 'Models', icon: Settings2 },
      { key: 'telephony', href: '/voice/telephony', label: 'Telephony', icon: Phone },
      { key: 'tools', href: '/voice/tools', label: 'Tools', icon: Wrench },
      { key: 'files', href: '/voice/files', label: 'Files', icon: Database },
      { key: 'recordings', href: '/voice/recordings', label: 'Recordings', icon: FileAudio },
      { key: 'developers', href: '/voice/developers', label: 'Developers', icon: KeyRound },
    ],
  },
  {
    title: 'OBSERVE',
    items: [
      { key: 'runs', href: '/voice/runs', label: 'Agent Runs', icon: BarChart3 },
      { key: 'reports', href: '/voice/reports', label: 'Reports', icon: FileText },
    ],
  },
] ;

const sections = navGroups.flatMap((group) => group.items);
type DialogName = 'agent' | 'uploadAgent' | 'folder' | 'campaign' | 'telephony' | 'tool' | 'file' | 'recording' | null;
type AgentPanel = 'agent' | 'workflow' | 'branches' | 'widget' | 'tests' | 'users';

type FlowNode = {
  id: string;
  kind: 'start' | 'global' | 'agent' | 'end';
  title: string;
  badge: string;
  prompt: string;
  x: number;
  y: number;
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
    title: 'start call',
    badge: 'Start Node',
    x: 380,
    y: 92,
    prompt:
      '# MAIN ACTION POINT AT THIS STAGE\nYou have received an inbound call from a user. Greet the user, tell them your name and company name if available, ask for their name, and ask how you can help them today.',
  },
  {
    id: 'global',
    kind: 'global',
    title: 'Global Node',
    badge: 'Global Node',
    x: 80,
    y: 402,
    prompt:
      '# OVERALL GOAL\nKeep every answer concise, helpful, and aligned with this team workflow. Use attached tools, files, and variables when available.',
  },
  {
    id: 'agent',
    kind: 'agent',
    title: 'Main Agenda and Questions',
    badge: 'Agent Node',
    x: 720,
    y: 402,
    prompt:
      '# MAIN ACTION POINT AT THIS STEP\nIdentify the caller need, collect the important details, and decide whether to answer, transfer, or close the call.',
  },
  {
    id: 'end',
    kind: 'end',
    title: 'End Call',
    badge: 'End Node',
    x: 390,
    y: 700,
    prompt:
      '# Main Action Point for This Stage\nThe conversation is complete. Thank the caller politely, summarize the outcome, and end the call immediately.',
  },
];

const nodeTone = {
  start: 'border-emerald-500/70 text-emerald-300',
  global: 'border-amber-500/70 text-amber-300',
  agent: 'border-blue-500/70 text-blue-300',
  end: 'border-rose-500/70 text-rose-300',
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
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
    realtime: false,
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
      if (!response.ok) throw new Error(payload.error || 'Could not save agent');
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
      setCreateStep('success');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create workflow.');
      setCreateStep('form');
    }
  }

  async function createCampaign() {
    const agentId = Number(campaignForm.agentId || agents[0]?.id);
    if (!campaignForm.name.trim() || !agentId) return;
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
  }

  async function createModelConfig() {
    if (!modelForm.provider.trim()) return;
    await postJson('/api/voice/models', {
      name: `${modelForm.provider} ${modelTab} stack`,
      llmProvider: modelTab === 'llm' ? modelForm.provider : 'openai',
      llmModel: modelTab === 'llm' ? modelForm.model : 'gpt-4o-mini',
      llmApiKey: modelForm.apiKey || null,
      sttProvider: modelTab === 'transcriber' ? modelForm.provider : 'openai',
      sttModel: modelTab === 'transcriber' ? modelForm.model : 'gpt-4o-mini-transcribe',
      ttsProvider: modelTab === 'voice' ? modelForm.provider : 'openai',
      ttsModel: modelTab === 'voice' ? modelForm.model : 'gpt-4o-mini-tts',
      isDefault: true,
    });
  }

  async function createTelephony() {
    if (!telephonyForm.name.trim()) return;
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
    setTelephonyForm({ name: '', provider: 'twilio', endpoint: '', accountSid: '', authToken: '', isDefaultOutbound: false });
    setDialog(null);
  }

  async function createTool() {
    if (!toolForm.name.trim()) return;
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
    setToolForm({ name: '', category: 'http_api', description: '', endpoint: '', method: 'POST', transferNumber: '', expression: '' });
    setDialog(null);
  }

  async function createFile() {
    if (!fileForm.name.trim()) return;
    await postJson('/api/voice/files', {
      name: fileForm.name,
      mimeType: fileForm.mimeType,
      contentText: fileForm.contentText,
      processingStatus: 'ready',
      metadata: { source: 'kyrn_voice_ui' },
    });
    setFileForm({ name: '', contentText: '', mimeType: 'application/pdf' });
    setDialog(null);
  }

  async function createRecording() {
    if (!recordingForm.name.trim()) return;
    await postJson('/api/voice/recordings', {
      name: recordingForm.name,
      transcript: recordingForm.transcript,
      metadata: { language: recordingForm.language },
    });
    setRecordingForm({ name: '', transcript: '', language: 'auto' });
    setDialog(null);
  }

  async function runAgent(agent: any) {
    setTestRunning(true);
    setTestEnded(false);
    setTestTranscript([{ role: 'system', content: 'Browser test call is starting...' }]);
    try {
      const session = await postJson('/api/voice/web-call/token', {
        agentId: agent.id,
      });
      setRuntimeSession(session);
      setTestTranscript((current) => [
        ...current,
        { role: 'user', content: 'Hi there, I am testing this Kyrn voice agent in the browser.' },
      ]);

      await postJson('/api/voice/runtime/events', {
        runId: session.run.id,
        event: {
          type: 'transcript.user',
          text: 'Hi there, I am testing this Kyrn voice agent in the browser.',
          at: new Date().toISOString(),
        },
      });
      await postJson('/api/voice/runtime/events', {
        runId: session.run.id,
        event: {
          type: 'transcript.agent',
          text: agent.firstMessage || 'Hi there, I am your Kyrn voice agent. How can I help you today?',
          at: new Date().toISOString(),
        },
      });
      setTestTranscript((current) => [
        ...current,
        { role: 'assistant', content: agent.firstMessage || 'Hi there, I am your Kyrn voice agent. How can I help you today?' },
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
    try {
      const response = await fetch(`/api/voice/agents/${agent.id}/definition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowJson: buildWorkflowPayload(agent, currentNodes),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Workflow could not be saved');

      if (publish) {
        const publishResponse = await fetch(`/api/voice/agents/${agent.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ definitionId: payload.definition?.id }),
        });
        const publishPayload = await publishResponse.json().catch(() => ({}));
        if (!publishResponse.ok) throw new Error(publishPayload.error || 'Workflow could not be published');
      }

      setUnsaved(false);
      mutate(`/api/voice/agents/${agent.id}/definition`);
      mutate('/api/voice/agents');
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
  const visibleEditorNodes = editorAgent
    ? nodes
    : definitionData?.definition
      ? definitionToFlowNodes(definitionData.definition)
      : nodeSeeds.map((node) => (
        node.id === 'start' && visibleEditorAgent?.systemPrompt ? { ...node, prompt: visibleEditorAgent.systemPrompt } : node
      ));

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
          setUnsaved={setUnsaved}
          onSaveWorkflow={(publish) => saveWorkflow(visibleEditorAgent, visibleEditorNodes, publish)}
          firstCallTip={firstCallTip}
          setFirstCallTip={setFirstCallTip}
        />
        {editNode && (
          <NodeDialog
            node={editNode}
            onClose={() => setEditNode(null)}
            onSave={(nextNode) => {
              setNodes((current) => current.map((node) => node.id === nextNode.id ? nextNode : node));
              setUnsaved(true);
              setEditNode(null);
            }}
          />
        )}
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
      {section === 'agents' && (
        activeAgent ? (
          <AgentDetailView
            key={`${activeAgent.id}-${activeAgentPanel}`}
            agent={activeAgent}
            panel={activeAgentPanel}
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
            const result = await postJson('/api/voice/agents', agentDefinition);
            setDialog(null);
            if (result.agent) openEditor(result.agent);
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
            <span className={`block truncate font-semibold ${voiceSidebarTextStrong}`}>Voice Agents</span>
            <span className={`block truncate text-xs ${voiceSidebarMuted}`}>Build and monitor calls</span>
          </span>
          <ChevronDown className={`h-4 w-4 ${voiceSidebarMuted} transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-[68px] z-30 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 dark:border-[#303630] dark:bg-[#151816]">
            <ProductOption href="/voice" icon={Mic} title="Voice Agents" description="Calls, campaigns, recordings" active />
            <ProductOption href="/automation" icon={MessageSquare} title="WhatsApp Agents" description="Automate inbox, replies, and flows" />
            <ProductOption href="/settings/developers" icon={Sparkles} title="Kyrn API" description="Keys, webhooks, integrations" />
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
                {!collapsed && 'Home'}
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
                      Create first agent
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
                      More
                    </button>
                  )}
                </div>
              </div>
            )}

            {navGroups.map((group) => (
              <div key={group.title} className="mb-7">
                {!collapsed && <p className={`mb-2 px-2 text-xs font-semibold ${voiceSidebarMuted}`}>{group.title === 'BUILD' ? 'Configure' : 'Monitor'}</p>}
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
            <p className={`text-sm font-semibold ${voiceSidebarTextStrong}`}>Test your agent</p>
            <p className={`mt-1 text-xs leading-4 ${voiceSidebarMuted}`}>Run a browser call before going live.</p>
          </div>
        )}
        <WorkspaceThemeToggle collapsed={collapsed} className={`${voiceSidebarText} hover:bg-[#0000170b] hover:text-[hsl(240_1.7%_11.2%)] dark:hover:bg-[#1b211d] dark:hover:text-white`} />
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
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
    { label: 'Knowledge Base', icon: Database, href: agentHref('/voice/files'), active: section === 'files' },
    { label: 'Analysis', icon: BarChart3, href: agentHref('/voice/reports'), active: section === 'reports' },
    { label: 'Tools', icon: Wrench, href: agentHref('/voice/tools'), active: section === 'tools' },
    { label: 'Widget', icon: Code2, href: agentHref('/voice', 'widget'), active: section === 'agents' && activePanel === 'widget' },
    { label: 'Settings', icon: Settings2, href: agentHref('/voice/models'), active: section === 'models' },
  ];
  const monitorItems = [
    { label: 'Dashboards', icon: BarChart3, href: agentHref('/voice/reports'), active: section === 'reports' },
    { label: 'Conversations', icon: MessageSquare, href: agentHref('/voice/runs'), active: section === 'runs' && activePanel !== 'tests' },
    { label: 'Tests', icon: ShieldCheck, href: agentHref('/voice/runs', 'tests'), active: section === 'runs' && activePanel === 'tests' },
    { label: 'Users', icon: Users, href: agentHref('/voice/developers', 'users'), active: section === 'developers' && activePanel === 'users' },
  ];
  const deployItems = [
    { label: 'Outbound', icon: Phone, href: agentHref('/voice/campaigns'), active: section === 'campaigns' },
  ];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${voiceSidebarItemIdle}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspace
      </button>

      <button
        type="button"
        onClick={onOpenWorkflow}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 text-left shadow-sm transition hover:border-zinc-300 hover:bg-[#0000170b] dark:border-[#303630] dark:bg-[#151816] dark:hover:bg-[#202620]"
      >
        <AgentOrb name={agent.name} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-semibold ${voiceSidebarTextStrong}`}>{agent.name}</span>
          <span className={`block truncate text-xs ${voiceSidebarMuted}`}>{agent.status || 'active'} workflow</span>
        </span>
      </button>

      <SidebarMenuGroup title="Configure" items={configureItems} />
      <SidebarMenuGroup title="Monitor" items={monitorItems} />
      <SidebarMenuGroup title="Deploy" items={deployItems} />
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
  overview,
  busy,
  onBack,
  onOpenWorkflow,
  onRun,
  onSave,
}: {
  agent: any;
  panel: AgentPanel;
  overview: any;
  busy: boolean;
  onBack: () => void;
  onOpenWorkflow: () => void;
  onRun: () => void;
  onSave: (updates: Record<string, any>) => Promise<any>;
}) {
  const systemPrompt = agent.systemPrompt || buildAgentPrompt(agent.name || 'Voice assistant', agent.description || 'Help callers and WhatsApp contacts clearly.', 'inbound');
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
    behavior: metadata.behavior || 'Default behavior',
  });
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [previewMessages, setPreviewMessages] = useState<Array<{ role: 'agent' | 'user'; content: string }>>([
    { role: 'agent', content: firstMessage },
  ]);

  const updateDraft = (updates: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setDirty(true);
    setSaveError('');
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
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Agent could not be saved.');
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
          <span>Main</span>
          <Badge className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Live 100%</Badge>
          {dirty && <Badge className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950/70 dark:text-amber-200">Unsaved changes</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <VoiceButton variant="light">Public</VoiceButton>
          <VoiceButton variant="light"><Code2 className="h-4 w-4" /> Variables</VoiceButton>
          <VoiceButton variant="light">Preview</VoiceButton>
          <VoiceButton variant="light" onClick={onOpenWorkflow}>Workflow</VoiceButton>
          <VoiceButton onClick={handleSave} disabled={!dirty || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Agent
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
                  <Badge className="rounded-full bg-zinc-950 text-white">New</Badge>
                  <span className={`rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm ${voicePageMuted} dark:border-[#303030] dark:bg-[#171717]`}>View new features</span>
                </div>
                <p className={`mt-2 max-w-2xl text-sm ${voicePageMuted}`}>One shared brain for browser calls, inbound phone calls, and WhatsApp automation.</p>
                {saveError && <p className="mt-2 text-sm font-semibold text-red-500">{saveError}</p>}
              </div>
              <CreditPill credits={overview?.credits} />
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              {panel === 'branches' ? (
                <AgentBranchesPanel agent={agent} />
              ) : panel === 'widget' ? (
                <AgentWidgetPanel agent={agent} />
              ) : (
                <>
                  <div className="space-y-7">
                    <div className={`rounded-xl p-5 ${voicePanelClass}`}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <VoiceField label="Agent name">
                          <Input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className={inputClass} />
                        </VoiceField>
                        <VoiceField label="Channel">
                          <NativeSelect value={draft.channelMode} onChange={(value) => updateDraft({ channelMode: value })}>
                            <option value="whatsapp_voice">WhatsApp + voice</option>
                            <option value="voice_only">Voice only</option>
                            <option value="whatsapp_only">WhatsApp only</option>
                          </NativeSelect>
                        </VoiceField>
                      </div>
                      <VoiceField label="Description" className="mt-4">
                        <Textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} rows={3} className={inputClass} />
                      </VoiceField>
                    </div>
                    <AgentTextPanel title="System prompt" value={draft.systemPrompt} rows={14} onChange={(value) => updateDraft({ systemPrompt: value })} />
                    <AgentTextPanel title="First message" value={draft.firstMessage} rows={5} footer="Interruptible" onChange={(value) => updateDraft({ firstMessage: value })} />
                  </div>

                  <div className="space-y-5">
                    <AgentSettingSelect
                      title="Voices"
                      description="Select the voices this agent can use."
                      value={draft.voice}
                      onChange={(value) => updateDraft({ voice: value })}
                      options={[
                        { value: 'Kyrn warm voice', label: 'Kyrn warm voice - Primary' },
                        { value: 'Kyrn clear voice', label: 'Kyrn clear voice' },
                        { value: 'Kyrn energetic voice', label: 'Kyrn energetic voice' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="Language"
                      description="Default and additional languages."
                      value={draft.defaultLanguage}
                      onChange={(value) => updateDraft({ defaultLanguage: value })}
                      options={[
                        { value: 'nl', label: 'Dutch - Default' },
                        { value: 'en', label: 'English' },
                        { value: 'de', label: 'German' },
                        { value: 'es', label: 'Spanish' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="LLM"
                      description="Provider and model for the agent."
                      value={draft.llmModel}
                      onChange={(value) => updateDraft({ llmModel: value })}
                      options={[
                        { value: 'gpt-4o-mini', label: 'OpenAI gpt-4o-mini' },
                        { value: 'gpt-4o', label: 'OpenAI gpt-4o' },
                        { value: 'qwen3-30b-a3b', label: 'Qwen3-30B-A3B' },
                      ]}
                    />
                    <AgentSettingSelect
                      title="Agent behavior"
                      description="Personality and channel-specific reply behavior."
                      value={draft.behavior}
                      onChange={(value) => updateDraft({ behavior: value })}
                      options={[
                        { value: 'Default behavior', label: 'Default behavior' },
                        { value: 'Short and direct', label: 'Short and direct' },
                        { value: 'Warm sales assistant', label: 'Warm sales assistant' },
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
              Mock tools
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
                aria-label="Run voice test"
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
                  placeholder="Send a message to start a chat"
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
                <VoiceButton variant="light" onClick={onRun}><Phone className="h-4 w-4" /> Test call</VoiceButton>
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
          <span>Type {'{{'} to add variables</span>
          {footer && <span className={`flex items-center gap-2 ${voicePageText}`}><Toggle checked onChange={() => {}} /> {footer}</span>}
        </div>
      </div>
    </div>
  );
}

function AgentBranchesPanel({ agent }: { agent: any }) {
  const branches = [
    { name: 'Main', status: 'Live 100%', description: 'Published branch used by browser tests, phone calls, and WhatsApp handoff.' },
    { name: 'Draft', status: 'Ready to edit', description: 'Workspace for the next prompt and workflow changes before publishing.' },
    { name: 'Experiment', status: 'Template', description: 'Use this branch to test a different greeting, language, or call objective.' },
  ];

  return (
    <div className="space-y-5 xl:col-span-2">
      <Panel title="Branches" subtitle={`Version and publish branches for ${agent.name}.`}>
        <div className="grid gap-4 md:grid-cols-3">
          {branches.map((branch) => (
            <div key={branch.name} className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">{branch.name}</h2>
                <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">{branch.status}</Badge>
              </div>
              <p className={`mt-4 text-sm leading-6 ${voicePageMuted}`}>{branch.description}</p>
              <VoiceButton variant="light" className="mt-5 w-full justify-center">Open branch</VoiceButton>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Publish History" subtitle="Recent versions for this agent.">
        <div className="divide-y divide-zinc-200 dark:divide-[#303030]">
          {['v1 Published', 'Draft autosaved', 'Imported workflow'].map((item) => (
            <div key={item} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">{item}</span>
              <span className={voicePageMuted}>May 24, 2026</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AgentWidgetPanel({ agent }: { agent: any }) {
  const embedCode = `<script src="https://kyrn.app/widget.js" data-agent-id="${agent.id}"></script>`;

  return (
    <div className="space-y-5 xl:col-span-2">
      <Panel title="Widget" subtitle="Configure the inline chat and call widget for this voice agent.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <VoiceField label="Embed code" help="Add this snippet to the pages where the agent should be available.">
              <Input value={embedCode} readOnly className={`${inputClass} font-mono text-xs`} />
            </VoiceField>
            <div className="space-y-3">
              {['Chat text-only mode', 'Send text while on call', 'Realtime transcript', 'Feedback collection'].map((setting, index) => (
                <div key={setting} className={`flex items-center justify-between rounded-lg p-3 ${voiceSoftPanelClass}`}>
                  <span className="text-sm font-semibold">{setting}</span>
                  <Toggle checked={index < 2} onChange={() => {}} />
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-3xl p-5 ${voicePanelClass}`}>
            <div className="mx-auto h-44 w-44 rounded-full bg-[conic-gradient(from_35deg,#0047ab,#5eead4,#e0ffff,#0066cc,#67e8f9,#0047ab)] shadow-xl shadow-cyan-500/20" />
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[#303030] dark:bg-[#101010]">
              <p className={voicePageMuted}>Send a message to start a chat</p>
              <div className="mt-6 flex items-center justify-between">
                <Settings2 className="h-4 w-4" />
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Play className="h-4 w-4 fill-current" />
                </button>
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
            <VoiceButton variant="ghost" onClick={onUpload}><Upload className="h-4 w-4" /> Upload Agent Definition</VoiceButton>
            <VoiceButton variant="ghost" onClick={onCreateFolder}><FolderPlus className="h-4 w-4" /> New Folder</VoiceButton>
            <VoiceButton onClick={onCreate}><Plus className="h-4 w-4" /> Create Agent</VoiceButton>
          </>
        )}
      />
      <section className="mx-auto max-w-[1505px] px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Your Agents</h1>
            <p className="mt-7 text-xl font-semibold">Active Agents</p>
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
            {isLoading ? 'Loading agents...' : 'No active workflows found. Create your first workflow to get started.'}
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
                      <p className={`line-clamp-1 text-sm ${voicePageMuted}`}>{agent.description || agent.systemPrompt || 'Shared WhatsApp and voice workflow'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {agent.isDefaultForWhatsapp && <Badge className="bg-emerald-500/15 text-emerald-300">WhatsApp default</Badge>}
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
      if (!response.ok) throw new Error(payload.error || `Could not ${action} campaign`);
      await mutate('/api/voice/campaigns');
      await mutate('/api/voice/overview');
      setCampaignActionStatus(`${campaign.name} ${action === 'start' ? 'started' : action === 'pause' ? 'paused' : 'resumed'}.`);
    } catch (error) {
      setCampaignActionStatus(error instanceof Error ? error.message : 'Campaign action failed.');
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
      ? 'AI generated demo follow-up'
      : lower.includes('reactivation')
        ? 'AI generated reactivation campaign'
        : 'AI generated voice campaign';
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
      leadFileName: leadRows.length ? 'Manual lead list' : '',
    });
    if (leadRows.length) setPreviewState('paused');
  }

  function selectContactSegment(segment: string) {
    const sampleRows = [
      { phone_number: '+31600000001', first_name: 'Sophie', segment, context: 'Requested a callback' },
      { phone_number: '+31600000002', first_name: 'Daan', segment, context: 'Interested in demo' },
      { phone_number: '+31600000003', first_name: 'Mila', segment, context: 'Needs pricing follow-up' },
    ];
    setForm({
      ...form,
      sourceType: 'contacts',
      contactSegment: segment,
      leadRows: sampleRows,
      leadFileName: `${segment} contacts`,
    });
    setPreviewState('paused');
  }

  function loadSampleLeads() {
    const sampleRows = [
      { phone_number: '+31600000011', first_name: 'Nora', company: 'Studio North', context: 'Asked for a product demo' },
      { phone_number: '+31600000012', first_name: 'Mats', company: 'Peak Sales', context: 'Needs pricing before Friday' },
      { phone_number: '+31600000013', first_name: 'Lina', company: 'Bright Ops', context: 'Wants WhatsApp and voice together' },
      { phone_number: '+31600000014', first_name: 'Omar', company: 'Scale Desk', context: 'Missed last callback' },
    ];
    setForm({
      ...form,
      sourceType: 'csv',
      leadRows: sampleRows,
      leadFileName: 'Sample campaign leads.csv',
    });
    setPreviewState('paused');
  }

  return (
    <SectionPage
      title="Campaigns"
      description="Create outbound voice campaigns with a selected agent, lead source, retry rules, and live queue tracking."
      action={<VoiceButton aria-label="Create campaign from header" onClick={onCreate} disabled={busy || !canCreateCampaign}><Plus className="h-4 w-4" /> Create campaign</VoiceButton>}
    >
      <div className={`rounded-[22px] p-5 ${voicePanelClass}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(240_1.7%_11.2%)] text-white dark:bg-white dark:text-zinc-950">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold">Campaign command center</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Generate, attach leads, preview the queue, then launch from one workspace.</p>
              </div>
            </div>
            <div className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-[#f8f8f7] px-4 py-3 dark:border-[#303030] dark:bg-[#101010]">
              <MessageSquare className={`h-5 w-5 shrink-0 ${voicePageMuted}`} />
              <input
                value={form.aiPrompt}
                onChange={(event) => setForm({ ...form, aiPrompt: event.target.value })}
                placeholder="Describe a campaign: call warm demo leads, qualify budget, book meetings..."
                aria-label="Campaign generation prompt"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={loadSampleLeads}
                aria-label="Attach sample campaign leads"
                className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-[hsl(240_1.7%_11.2%)] transition hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:text-white dark:hover:bg-[#242424] md:inline-flex"
              >
                Attach sample
              </button>
              <button
                type="button"
                onClick={generateCampaignSetup}
                disabled={!String(form.aiPrompt || '').trim()}
                aria-label="Generate campaign setup from prompt"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[hsl(240_1.7%_11.2%)] px-4 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:w-[420px]">
            {[
              ['Agent', activeAgent?.name || 'Select agent'],
              ['Leads', `${leadCount} ready`],
              ['Concurrency', `${form.maxConcurrency || 1} calls`],
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
                { key: 'generate', title: 'Generate with AI', text: 'Describe a campaign and let Kyrn shape the setup.', icon: Sparkles },
                { key: 'template', title: 'Use template', text: 'Start from a proven outbound campaign pattern.', icon: FileText },
                { key: 'blank', title: 'Blank campaign', text: 'Build every setting manually.', icon: Pencil },
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
                  <h2 className="text-xl font-bold">Generate campaign setup</h2>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>Describe the outcome, audience and tone. Kyrn fills the first setup pass.</p>
                </div>
                <Sparkles className="h-5 w-5 text-cyan-500" />
              </div>
              <Textarea
                value={form.aiPrompt}
                onChange={(event) => setForm({ ...form, aiPrompt: event.target.value })}
                rows={4}
                placeholder="Example: Call warm demo leads from last week, qualify timeline and book a meeting if they are ready."
                className={`${inputClass} mt-5`}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-sm ${voicePageMuted}`}>This stays editable after generation.</p>
                <VoiceButton variant="ghost" onClick={generateCampaignSetup} disabled={!String(form.aiPrompt || '').trim()}>
                  <Sparkles className="h-4 w-4" /> Generate setup
                </VoiceButton>
              </div>
            </div>
          )}

          {mode === 'template' && (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Campaign templates</h2>
                  <p className={`mt-1 text-sm ${voicePageMuted}`}>Start from a reusable outbound pattern.</p>
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
                    <p className="mt-4 text-xs font-semibold text-cyan-600 dark:text-cyan-300">{template.concurrency} concurrent calls</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Campaign setup</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Name the campaign, choose the agent, then attach leads.</p>
              </div>
              <Badge className={`${previewState === 'running' ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'}`}>
                {previewState === 'running' ? 'Preview running' : 'Draft'}
              </Badge>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <VoiceField label="Campaign name" help="Shown in reports, runs, and lead queues.">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. June demo follow-up" className={inputClass} />
              </VoiceField>
              <VoiceField label="Voice agent" help="The workflow used for every call.">
                <NativeSelect value={form.agentId} onChange={(value) => setForm({ ...form, agentId: value })} className="w-full">
                  <option value="">Select an agent</option>
                  {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                </NativeSelect>
              </VoiceField>
              <VoiceField label="Telephony" help="Caller ID and outbound provider.">
                {telephony.length === 0 ? (
                  <div className={`rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm dark:border-[#333] ${voicePageMuted}`}>
                    No telephony configuration yet. Add one in Telephony to start calling.
                  </div>
                ) : (
                  <NativeSelect value={form.telephonyConfigId} onChange={(value) => setForm({ ...form, telephonyConfigId: value })} className="w-full">
                    <option value="">Default telephony configuration</option>
                    {telephony.map((config) => <option key={config.id} value={config.id}>{config.name}</option>)}
                  </NativeSelect>
                )}
              </VoiceField>
              <VoiceField label="Lead source" help="CSV is active now; contacts and manual lists are prepared.">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['csv', 'CSV'],
                    ['manual', 'Manual'],
                    ['contacts', 'Contacts'],
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
                <h2 className="text-xl font-bold">Lead source</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Load the people this campaign should call.</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => handleCsvFile(event.target.files?.[0])} />
              {form.sourceType === 'csv' && <VoiceButton variant="ghost" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Upload CSV</VoiceButton>}
            </div>
            <div className={`mt-5 rounded-xl p-5 ${voiceSoftPanelClass}`}>
              {form.sourceType === 'manual' ? (
                <div>
                  <Textarea
                    value={form.manualLeadText}
                    onChange={(event) => setForm({ ...form, manualLeadText: event.target.value })}
                    rows={6}
                    placeholder="+31600000001, Sophie, Requested demo&#10;+31600000002, Daan, Asked about pricing"
                    className={inputClass}
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-sm ${voicePageMuted}`}>One lead per line: phone, name, context.</p>
                    <VoiceButton variant="ghost" onClick={loadManualLeads}>Load manual leads</VoiceButton>
                  </div>
                </div>
              ) : form.sourceType === 'contacts' ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {['Hot leads', 'Demo requested', 'No reply 7d'].map((segment) => (
                    <button
                      key={segment}
                      type="button"
                      onClick={() => selectContactSegment(segment)}
                      className={`rounded-xl border p-4 text-left transition ${form.contactSegment === segment ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-200 bg-white hover:bg-[#0000170b] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]'}`}
                    >
                      <Users className="mb-4 h-5 w-5" />
                      <p className="font-semibold">{segment}</p>
                      <p className={`mt-2 text-sm ${voicePageMuted}`}>Load a contact segment preview.</p>
                    </button>
                  ))}
                </div>
              ) : form.leadRows?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{form.leadFileName || 'Uploaded CSV'}</p>
                      <p className={`text-sm ${voicePageMuted}`}>{form.leadRows.length} leads ready to queue</p>
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
                  <span className="font-semibold">Drop or choose your leads CSV</span>
                  <span className={`mt-2 text-sm ${voicePageMuted}`}>phone_number, first_name, company, context</span>
                </button>
              )}
              {!form.leadRows?.length && form.sourceType === 'csv' && (
                <div className="mt-4 flex justify-center">
                  <VoiceButton variant="ghost" onClick={loadSampleLeads}>
                    <Sparkles className="h-4 w-4" />
                    Load sample leads
                  </VoiceButton>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)} className="flex w-full items-center justify-between text-left">
              <div>
                <h2 className="text-xl font-bold">Advanced settings</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Concurrency, retry policy, and call windows.</p>
              </div>
              <ChevronDown className={`h-5 w-5 transition ${advancedOpen ? 'rotate-180' : ''}`} />
            </button>
            {advancedOpen && (
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <VoiceField label="Concurrency">
                  <Input value={form.maxConcurrency} type="number" min={1} max={25} onChange={(event) => setForm({ ...form, maxConcurrency: Number(event.target.value || 1) })} className={inputClass} />
                </VoiceField>
                <VoiceField label="Retry attempts">
                  <Input value={form.retryCount || 2} type="number" min={0} max={10} onChange={(event) => setForm({ ...form, retryCount: Number(event.target.value || 0) })} className={inputClass} />
                </VoiceField>
                <VoiceField label="Call window">
                  <NativeSelect value={form.callWindow || 'business'} onChange={(value) => setForm({ ...form, callWindow: value })} className="w-full">
                    <option value="business">Business hours</option>
                    <option value="evening">Evening follow-up</option>
                    <option value="custom">Custom</option>
                  </NativeSelect>
                </VoiceField>
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Launch preview</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Simulate the queue before creating the campaign.</p>
              </div>
              <div className="flex gap-2">
                <VoiceButton variant="ghost" onClick={() => setPreviewState(previewState === 'running' ? 'paused' : 'running')} disabled={!leadCount}>
                  {previewState === 'running' ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {previewState === 'running' ? 'Pause preview' : 'Run preview'}
                </VoiceButton>
                <VoiceButton variant="ghost" onClick={() => setPreviewState('idle')} disabled={previewState === 'idle'}>
                  Reset
                </VoiceButton>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <CampaignStat label="Queued" value={queueStats.queued} />
              <CampaignStat label="Active calls" value={queueStats.active} />
              <CampaignStat label="Completed" value={queueStats.completed} />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className={voicePageMuted}>Batch progress</span>
                <span className="font-semibold">{queueProgress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#303030]">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${queueProgress}%` }} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ['Agent', activeAgent?.name || 'Select an agent'],
                ['Provider', activeTelephony?.name || 'Default telephony'],
                ['Retry policy', `${form.retryCount || 2} retries · ${form.callWindow || 'business'} window`],
                ['Lead source', form.leadFileName || form.sourceType || 'CSV'],
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
                <h2 className="font-bold">Campaign cockpit</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>A quick operational view before launch.</p>
              </div>
              <Radio className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['Prepare audience', leadCount ? 'done' : 'waiting'],
                ['Reserve credits', leadCount && activeAgent ? 'ready' : 'waiting'],
                ['Dial batch', previewState],
                ['Report outcome', previewState === 'running' ? 'streaming' : 'idle'],
              ].map(([label, status], index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${status === 'done' || status === 'ready' || status === 'streaming' ? 'bg-emerald-500 text-white' : status === 'running' ? 'bg-cyan-500 text-white' : 'bg-zinc-200 text-zinc-500 dark:bg-[#303030]'}`}>
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
            <h2 className="font-bold">Campaign readiness</h2>
            <div className="mt-5 space-y-3">
              <ReadinessRow done={Boolean(form.name.trim())} label="Campaign named" />
              <ReadinessRow done={Boolean(form.agentId || agents[0]?.id)} label="Agent selected" />
              <ReadinessRow done={telephony.length > 0} label="Telephony connected" />
              <ReadinessRow done={form.leadRows?.length > 0} label="Leads uploaded" />
            </div>
            <VoiceButton aria-label="Create campaign from readiness" onClick={onCreate} disabled={busy || !form.name.trim() || !agents.length} className="mt-6 w-full justify-center">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Create campaign
            </VoiceButton>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Existing campaigns</h2>
            {campaigns.length === 0 ? (
              <p className={`mt-4 text-sm leading-6 ${voicePageMuted}`}>No campaigns yet. Your first campaign will appear here with progress, retries, and reports.</p>
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
                  <h2 className="font-bold">Selected campaign</h2>
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
              <p className={`mt-4 text-xs leading-5 ${voicePageMuted}`}>These controls call the native campaign runner endpoints, so the status updates in the same data layer used by reports and runs.</p>
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
  const [selectedPreset, setSelectedPreset] = useState('fast');
  const [connectionCheck, setConnectionCheck] = useState<'idle' | 'checking' | 'ok'>('idle');
  const modelOptions = modelOptionsForProvider(form.provider, modelTab);
  const recommendedStacks = modelTab === 'voice'
    ? [
        { id: 'quality', title: 'Premium voice', text: 'ElevenLabs for polished sales and support calls.', provider: 'elevenlabs', model: 'eleven_flash_v2_5' },
        { id: 'multilingual', title: 'Multilingual voice', text: 'MiniMax for expressive multilingual campaigns.', provider: 'minimax', model: 'speech-02-hd' },
        { id: 'clone', title: 'Voice clone', text: 'Chatterbox/Resemble style clone previews.', provider: 'chatterbox', model: 'chatterbox-tts' },
      ]
    : [
        { id: 'fast', title: 'Fast realtime', text: 'Qwen realtime or OpenAI realtime for low-latency calls.', provider: modelTab === 'embedding' ? 'openai' : 'qwen', model: modelTab === 'embedding' ? 'text-embedding-3-small' : 'qwen3-30b-a3b' },
        { id: 'sales', title: 'Sales quality', text: 'MiniMax or OpenAI for richer reasoning and tool use.', provider: 'minimax', model: modelTab === 'transcriber' ? 'speech-01' : 'abab6.5s-chat' },
        { id: 'experimental', title: 'Experimental', text: 'Xiaomi MiMo slot for upcoming provider tests.', provider: 'xiaomi-mimo', model: 'mimo-vl-7b' },
      ];

  function selectProvider(providerId: string) {
    const firstModel = modelOptionsForProvider(providerId, modelTab)[0] || 'default';
    setForm({ ...form, provider: providerId, model: firstModel });
    setTestStatus(`${providerId} selected for ${modelTab}`);
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
    setTestStatus('Extra API key slot added');
  }

  function removeApiKeySlot(index: number) {
    setApiKeySlots((slots) => slots.filter((_, slotIndex) => slotIndex !== index));
    setTestStatus('Extra API key slot removed');
  }

  function chooseVoice(voice: any) {
    setSelectedVoice(voice.id);
    setPreviewVoice('');
    setForm({
      ...form,
      provider: voice.provider || form.provider,
      model: voice.model || voice.id,
    });
    setTestStatus(`${voice.name} selected as primary voice`);
  }

  function previewVoiceSample(voice: any) {
    setPreviewVoice(voice.id);
    setTestStatus(`Playing preview for ${voice.name}`);
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
    setTestStatus(`${stack.title} applied: ${stack.provider} · ${stack.model}`);
  }

  function runConnectionCheck() {
    setConnectionCheck('checking');
    window.setTimeout(() => {
      setConnectionCheck('ok');
      setTestStatus(`${form.provider || 'Provider'} connection profile is ready for saving`);
    }, 650);
  }

  return (
    <SectionPage
      title="Models"
      description="Configure LLM, voice, transcription and embedding providers for your agents."
      action={<VoiceButton onClick={onSave} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save configuration</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
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
                <h2 className="text-xl font-bold">Realtime mode</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Use a speech-to-speech model where available, with LLM fallback for tools and QA.</p>
              </div>
              <Toggle checked={form.realtime} onChange={() => setForm({ ...form, realtime: !form.realtime })} />
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Provider</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Choose the service Kyrn should use for {modelTab}.</p>
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
                  <Input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Enter custom model name" className={inputClass} />
                ) : (
                  <NativeSelect value={form.model} onChange={(value) => setForm({ ...form, model: value })} className="w-full">
                    {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                  </NativeSelect>
                )}
                <label className={`mt-3 flex cursor-pointer items-center gap-2 text-sm ${voicePageMuted}`}>
                  <input type="checkbox" checked={customModel} onChange={() => setCustomModel(!customModel)} className="accent-cyan-500" />
                  Enter custom value
                </label>
              </VoiceField>
              <VoiceField label="Default usage">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{modelTab === 'voice' ? 'Primary voice stack' : `Primary ${modelTab} stack`}</p>
                  <p className={`mt-2 text-sm ${voicePageMuted}`}>New agents will use this config unless overridden.</p>
                </div>
              </VoiceField>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">API keys</p>
                  <p className={`text-sm ${voicePageMuted}`}>Keys are masked and stored against your team configuration.</p>
                </div>
                <VoiceButton variant="ghost" onClick={addApiKeySlot}><Plus className="h-4 w-4" /> Add key</VoiceButton>
              </div>
              <div className="space-y-3">
                {apiKeySlots.map((slot, index) => (
                  <div key={slot.id} className="flex gap-2">
                    <Input
                      value={index === 0 ? form.apiKey : slot.value}
                      onChange={(event) => updateApiKeySlot(index, event.target.value)}
                      placeholder={index === 0 ? 'sk-...' : 'Additional masked key slot'}
                      type="password"
                      className={inputClass}
                    />
                    {index > 0 && (
                      <VoiceButton
                        variant="ghost"
                        onClick={() => removeApiKeySlot(index)}
                        aria-label="Remove API key slot"
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
              <h2 className="font-bold">Voice library</h2>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>Preview and choose the primary agent voice.</p>
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
                      {selectedVoice === voice.id && <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">Primary</Badge>}
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
                        aria-label={`Preview ${voice.name}`}
                      >
                        <Play className="h-4 w-4" />
                      </span>
                    </div>
                    <div className={`mt-4 h-7 rounded-full ${previewVoice === voice.id ? 'animate-pulse bg-[repeating-linear-gradient(90deg,rgba(20,184,166,.85)_0_5px,transparent_5px_11px)]' : 'bg-[repeating-linear-gradient(90deg,rgba(20,184,166,.35)_0_4px,transparent_4px_10px)]'}`} />
                    {previewVoice === voice.id && <p className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-300">Preview playing</p>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
              <h2 className="font-bold">Recommended stack</h2>
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
            <h2 className="font-bold">Connection check</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Validate the visible stack before saving it for agents.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Provider</p>
                <p className="mt-2 truncate font-semibold">{form.provider || 'Not selected'}</p>
              </div>
              <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Model</p>
                <p className="mt-2 truncate font-semibold">{form.model || 'Default'}</p>
              </div>
            </div>
            <VoiceButton variant="ghost" onClick={runConnectionCheck} className="mt-5 w-full justify-center">
              {connectionCheck === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {connectionCheck === 'ok' ? 'Profile ready' : connectionCheck === 'checking' ? 'Checking...' : 'Run check'}
            </VoiceButton>
          </div>

          <Panel title="Saved configurations" subtitle="Reusable model stacks for this team">
            {models.length === 0 ? (
              <p className={`text-sm leading-6 ${voicePageMuted}`}>No saved model configs yet. Save this setup to make it available for agents.</p>
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
    { id: 'twilio', name: 'Twilio', text: 'Production-ready inbound and outbound calls', icon: Phone },
    { id: 'sip', name: 'LiveKit SIP', text: 'Recommended for realtime runtime routing', icon: Radio },
    { id: 'asterisk_ari', name: 'Asterisk ARI', text: 'Self-hosted PBX connection', icon: Cable },
  ];

  useEffect(() => {
    if (selectedConfigId !== 'new' || !telephony.length) return;
    setSelectedConfigId(telephony[0].id);
    setSelectedProvider(telephony[0].provider || 'twilio');
  }, [selectedConfigId, telephony]);

  return (
    <SectionPage
      title="Telephony"
      description="Connect call providers, assign phone numbers, and route inbound traffic to the right voice agent."
      action={<VoiceButton onClick={() => onAdd(selectedProvider)}><Plus className="h-4 w-4" /> Add configuration</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Providers</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Choose a provider to configure or review routing status.</p>
              </div>
              <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">Runtime ready</Badge>
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
                      {selectedProvider === provider.id ? 'Selected' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <VoiceButton variant="ghost" onClick={() => onAdd(selectedProvider)}>
                <Plus className="h-4 w-4" /> Configure {providers.find((provider) => provider.id === selectedProvider)?.name}
              </VoiceButton>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Configurations</h2>
                <p className={`mt-1 text-sm ${voicePageMuted}`}>Provider accounts available for test calls and campaigns.</p>
              </div>
              <VoiceButton variant="ghost" onClick={() => onAdd(selectedProvider)}><Plus className="h-4 w-4" /> New config</VoiceButton>
            </div>
            {telephony.length === 0 ? (
              <div className={`mt-6 rounded-xl p-6 ${voiceSoftPanelClass}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">No telephony configurations yet</p>
                    <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>Add Twilio or LiveKit SIP settings to enable browser calls, inbound numbers, outbound tests and campaign dialing.</p>
                    <VoiceButton onClick={() => onAdd(selectedProvider)} className="mt-5"><Plus className="h-4 w-4" /> Add configuration</VoiceButton>
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
                        <p className={`mt-1 text-sm ${voicePageMuted}`}>{config.provider || 'twilio'} · {config.isDefaultOutbound ? 'default outbound' : 'manual selection'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConfigId === config.id && <CheckCircle2 className="h-4 w-4 text-cyan-500" />}
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">Connected</Badge>
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
            <h2 className="font-bold">Selected setup</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>{selectedConfig ? 'Inspect this provider before routing live calls.' : 'Select a provider card or create a configuration.'}</p>
            <div className={`mt-5 rounded-xl p-4 ${voiceSoftPanelClass}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${voicePageMuted}`}>Provider</p>
              <p className="mt-2 font-semibold">{selectedConfig?.name || providers.find((provider) => provider.id === selectedProvider)?.name || 'New configuration'}</p>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>{selectedConfig?.provider || selectedProvider} · {selectedConfig?.isDefaultOutbound ? 'default outbound' : 'ready to configure'}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <VoiceButton
                variant="ghost"
                onClick={() => setTelephonyCheck(`Inbound route checked for ${selectedConfig?.name || selectedProvider}`)}
                className="justify-center"
              >
                <Phone className="h-4 w-4" /> Test inbound
              </VoiceButton>
              <VoiceButton
                variant="ghost"
                onClick={() => {
                  setCopiedWebhook(true);
                  setTelephonyCheck('Webhook URL copied for runtime events');
                }}
                className="justify-center"
              >
                <Code2 className="h-4 w-4" /> {copiedWebhook ? 'Copied' : 'Webhook'}
              </VoiceButton>
            </div>
            {telephonyCheck && (
              <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                {telephonyCheck}
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Phone numbers</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Route each number to a voice agent.</p>
            <div className="mt-5 space-y-3">
              {[
                ['+31 20 000 0000', 'Inbound demo number', 'Unassigned'],
                ['+1 555 0199', 'Outbound caller ID', 'Default'],
              ].map(([number, label, status]) => (
                <div key={number} className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{number}</p>
                      <p className={`mt-1 text-sm ${voicePageMuted}`}>{label}</p>
                      {routedNumbers[number] && <p className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300">Routed to {routedNumbers[number]}</p>}
                      {lastTestedNumber === number && <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">Test event sent</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-[#343434] dark:text-zinc-300">{routedNumbers[number] ? 'Assigned' : status}</Badge>
                      <button
                        type="button"
                        aria-label={`${routedNumbers[number] ? 'Clear route for' : 'Assign'} ${number}`}
                        onClick={() => setRoutedNumbers((current) => ({ ...current, [number]: current[number] ? '' : 'Default voice agent' }))}
                        className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
                      >
                        {routedNumbers[number] ? 'Clear route' : 'Assign'}
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
            <h2 className="font-bold">Call routing</h2>
            <div className="mt-5 space-y-3">
              <ReadinessRow done={telephony.length > 0} label="Provider credentials" />
              <ReadinessRow done={telephony.length > 0} label="Outbound caller ID" />
              <ReadinessRow done={Object.values(routedNumbers).some(Boolean)} label="Inbound number mapping" />
              <ReadinessRow done={lastTestedNumber.length > 0} label="Test route event" />
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
    ['end_call', 'End conversation', 'Allow the agent to end a call cleanly.'],
    ['transfer_call', 'Transfer to number', 'Send a caller to a human or department.'],
    ['calculator', 'Calculator', 'Perform simple arithmetic during a conversation.'],
    ['webhook', 'Webhook tool', 'Call an internal event endpoint.'],
  ];
  const selectedCustomTool = tools.find((tool) => tool.id === selectedToolId);
  const selectedSystemTool = systemTools.find(([id]) => selectedToolId === `system:${id}`);

  function runToolTest() {
    if (selectedCustomTool) {
      setToolTestStatus(`${selectedCustomTool.name} test payload prepared`);
      return;
    }
    if (selectedSystemTool) {
      if (!enabledSystemTools.includes(selectedSystemTool[0])) {
        setToolTestStatus(`Enable ${selectedSystemTool[1]} before testing it`);
        return;
      }
      setToolTestStatus(`${selectedSystemTool[1]} is ready in the runtime tool palette`);
    }
  }

  return (
    <SectionPage
      title="Tools"
      description="Manage reusable actions your voice agents can call during a conversation."
      action={<VoiceButton onClick={onCreate}><Plus className="h-4 w-4" /> Create Tool</VoiceButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Your tools</h2>
              <p className={`mt-1 text-sm ${voicePageMuted}`}>HTTP APIs, transfers, call controls and utility tools.</p>
            </div>
            <VoiceButton variant="ghost" onClick={onCreate}><Plus className="h-4 w-4" /> Add tool</VoiceButton>
          </div>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools..." className={`${inputClass} pl-9`} />
            </div>
            <NativeSelect value={category} onChange={setCategory}>
              <option value="all">All types</option>
              <option value="http_api">HTTP API</option>
              <option value="end_call">End call</option>
              <option value="transfer_call">Transfer</option>
              <option value="calculator">Calculator</option>
            </NativeSelect>
          </div>
          {filteredTools.length === 0 ? (
            <div className={`mt-6 rounded-xl p-8 text-center ${voiceSoftPanelClass}`}>
              <Wrench className={`mx-auto mb-4 h-8 w-8 ${voicePageMuted}`} />
              <p className="font-semibold">{tools.length ? 'No tools match this filter' : 'No custom tools yet'}</p>
              <p className={`mx-auto mt-2 max-w-md text-sm leading-6 ${voicePageMuted}`}>Create an HTTP tool, transfer action, calculator, or webhook so agents can do useful work mid-call.</p>
              <VoiceButton onClick={onCreate} className="mt-5"><Plus className="h-4 w-4" /> Create Tool</VoiceButton>
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
            <h2 className="font-bold">System tools</h2>
            <p className={`mt-1 text-sm ${voicePageMuted}`}>Built-in actions available to the runtime.</p>
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
                      ariaLabel={`${enabledSystemTools.includes(id) ? 'Disable' : 'Enable'} ${title}`}
                      onChange={() => {
                        setEnabledSystemTools((current) =>
                          current.includes(id) ? current.filter((toolId) => toolId !== id) : [...current, id]
                        );
                        setToolTestStatus(
                          enabledSystemTools.includes(id)
                            ? `${title} disabled for runtime`
                            : `${title} enabled for runtime`
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${voicePanelClass}`}>
            <h2 className="font-bold">Tool detail</h2>
            {selectedCustomTool ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{selectedCustomTool.name}</p>
                  <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>{selectedCustomTool.description || 'No description yet.'}</p>
                </div>
                <ReadinessRow done label="Available to agents" />
                <ReadinessRow done={selectedCustomTool.status === 'active'} label="Active status" />
                <VoiceButton variant="ghost" onClick={runToolTest} className="w-full justify-center"><Play className="h-4 w-4" /> Test payload</VoiceButton>
                <VoiceButton variant="ghost" onClick={onCreate} className="w-full justify-center"><Plus className="h-4 w-4" /> Add another tool</VoiceButton>
              </div>
            ) : selectedSystemTool ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-xl p-4 ${voiceSoftPanelClass}`}>
                  <p className="font-semibold">{selectedSystemTool[1]}</p>
                  <p className={`mt-2 text-sm leading-6 ${voicePageMuted}`}>{selectedSystemTool[2]}</p>
                </div>
                {selectedSystemTool[0] === 'transfer_call' && (
                  <VoiceField label="Transfer number" help="Used when a workflow node enables call transfer.">
                    <Input value={transferNumber} onChange={(event) => setTransferNumber(event.target.value)} className={inputClass} />
                  </VoiceField>
                )}
                <ReadinessRow done={enabledSystemTools.includes(selectedSystemTool[0])} label="Enabled for runtime" />
                <ReadinessRow done label="No credentials required" />
                <ReadinessRow done={selectedSystemTool[0] !== 'transfer_call' || Boolean(transferNumber.trim())} label={selectedSystemTool[0] === 'transfer_call' ? 'Transfer number configured' : 'Ready to execute'} />
                <VoiceButton variant="ghost" onClick={runToolTest} className="w-full justify-center"><Play className="h-4 w-4" /> Test tool</VoiceButton>
              </div>
            ) : (
              <p className={`mt-5 text-sm leading-6 ${voicePageMuted}`}>Select a custom or system tool to inspect how agents can use it.</p>
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
      title="Knowledge Base Files"
      description="Upload and manage documents for your voice agents to reference. Learn more"
      action={<VoiceButton onClick={onUpload}><Upload className="h-4 w-4" /> Upload Document</VoiceButton>}
    >
      <Panel title="Your Documents" subtitle="Documents shared across all agents in your organization">
        <div className="flex gap-3">
          <SearchRow className="flex-1" placeholder="Search documents..." />
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
      title="Recordings"
      description="Manage audio recordings for your organization. Use @ in prompt fields to insert them, or as transition messages in tool calls. Learn more"
      action={<VoiceButton onClick={onUpload}><Upload className="h-4 w-4" /> Upload Recording</VoiceButton>}
    >
      <Panel title="All Recordings" subtitle="Audio recordings shared across all agents in your organization">
        <div className="flex gap-3">
          <SearchRow className="flex-1" placeholder="Search by filename, transcript, or ID..." />
          <VoiceButton variant="ghost"><RefreshCw className="h-4 w-4" /></VoiceButton>
        </div>
        <p className="mt-4 text-sm text-zinc-500">{recordings.length} recordings</p>
        {recordings.length > 0 && <RecordList rows={recordings} detail={(row) => row.transcript || row.mimeType || 'audio file'} />}
      </Panel>
    </SectionPage>
  );
}

function DevelopersView({ data }: { data: any }) {
  const keys = data?.apiKeys || [];
  return (
    <SectionPage title="Developer Portal" description="Manage your API keys to access Kyrn voice services programmatically">
      <div className="space-y-6">
        <DeveloperKeyPanel
          title="API Keys"
          subtitle="Create and manage API keys for your organization"
          keys={keys}
          button="Create New Key"
          prefix="dgr_Eo9o..."
        />
        <DeveloperKeyPanel
          title="Kyrn Service Keys"
          subtitle="Manage service keys for accessing AI services (LLM, TTS, STT)"
          keys={[{ id: 'service', name: 'Default Kyrn Model Service Key', createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() }]}
          button="Create Service Key"
          prefix="mps_sk_pqV..."
        />
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm text-amber-700 dark:text-amber-200">
          <strong>Important:</strong> Keep your API keys secure. Never share them publicly or commit them to version control.
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
      title="Agent Runs"
      description="See all your Agent Runs across all Voice Agents. You can use filters to filter out required Agent Runs."
      action={<NativeSelect value="amsterdam" onChange={() => {}}><option value="amsterdam">(GMT+2:00) Amsterdam, Berlin, Bern...</option></NativeSelect>}
    >
      <Panel title="Kyrn Model Credits" subtitle="These track usage of Kyrn models using team service keys.">
        <div className="mt-8 flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold">{used.toFixed(2)}</span>
            <span className={`ml-2 ${voicePageMuted}`}>/ {totalCredits.toFixed(2)}</span>
            <p className={`text-sm ${voicePageMuted}`}>Credits Used</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{remaining.toFixed(2)}</p>
            <p className={`text-sm ${voicePageMuted}`}>Remaining</p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#4a4a4a]">
          <div className="h-full rounded-full bg-[hsl(240_1.7%_11.2%)] dark:bg-zinc-100" style={{ width: `${Math.min((used / totalCredits) * 100, 100)}%` }} />
        </div>
      </Panel>
      <Panel title="Filter Workflow Runs" subtitle="Build custom filters to find specific workflow runs">
        <div className="mt-5 flex items-center justify-between gap-4">
          <NativeSelect value="" onChange={() => {}} className="flex-1"><option value="">Select attribute to filter by</option></NativeSelect>
          <VoiceButton variant="ghost">Templates</VoiceButton>
        </div>
      </Panel>
      <Panel title="All Runs" subtitle="Every agent run across your organization, with usage details">
        <div className="mt-7 overflow-hidden rounded-lg border border-zinc-200 dark:border-[#2c2c2c]">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#0000170b] text-left text-zinc-500 dark:bg-[#202020] dark:text-zinc-400">
              <tr>
                {['Run ID', 'Agent Name', 'Call Type', 'Phone Number', 'Disposition', 'Date', 'Duration', 'Tokens', 'Actions'].map((head) => (
                  <th key={head} className="px-4 py-4 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">No runs yet.</td></tr>
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
      title="Daily Reports"
      description="Showing data for Europe/Amsterdam timezone"
      action={(
        <div className="flex gap-3">
          <NativeSelect value="all" onChange={() => {}}><option value="all">All Workflows</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</NativeSelect>
          <VoiceButton variant="ghost"><Calendar className="h-4 w-4" /> May 24, 2026</VoiceButton>
        </div>
      )}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricPanel title="Total Workflow Runs" value={totalRuns} description="Total calls processed today" />
        <MetricPanel title="Transfer Dispositions" value={0} description="Calls transferred (XFER)" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Disposition Distribution">
          <div className={`flex h-[320px] items-center justify-center ${voicePageMuted}`}>No disposition data available</div>
        </Panel>
        <Panel title="Call Duration Distribution">
          <div className="relative mt-5 h-[300px] border-l border-b border-zinc-300 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:95px_65px] dark:border-[#4a4a4a] dark:bg-[linear-gradient(#242424_1px,transparent_1px),linear-gradient(90deg,#242424_1px,transparent_1px)]">
            <div className="absolute bottom-[-28px] left-0 grid w-full grid-cols-6 text-center text-xs text-zinc-500">
              {['0-10s', '10-30s', '30-60s', '60-120s', '120-180s', '>180s'].map((label) => <span key={label}>{label}</span>)}
            </div>
          </div>
        </Panel>
      </div>
      <div className={`rounded-lg px-6 py-8 text-center ${voicePanelClass} ${voicePageMuted}`}>
        {runs.length === 0 ? 'No workflow runs found for May 24, 2026' : `${runs.length} workflow runs found for May 24, 2026`}
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
  setUnsaved: (value: boolean) => void;
  onSaveWorkflow: (publish?: boolean) => Promise<void>;
  firstCallTip: boolean;
  setFirstCallTip: (value: boolean) => void;
}) {
  const { agent, nodes, selectedNodeId, setSelectedNodeId, setEditNode, onBack, onRun, testMode, setTestMode, testRunning, testEnded, testTranscript, runtimeSession, unsaved, onSaveWorkflow, firstCallTip, setFirstCallTip } = props;
  const reactFlowNodes = useMemo(() => nodes.map((node) => ({
    id: node.id,
    type: 'kyrnVoiceNode',
    position: { x: node.x, y: node.y },
    data: { node, onEdit: setEditNode },
    selected: node.id === selectedNodeId,
  })), [nodes, selectedNodeId, setEditNode]);
  const reactFlowEdges = useMemo(() => [
    { id: 'start-agent', source: nodeIdByKind(nodes, 'start'), target: nodeIdByKind(nodes, 'agent'), type: 'kyrnVoiceEdge', data: { label: 'Move to Main Agenda' } },
    { id: 'global-agent', source: nodeIdByKind(nodes, 'global'), target: nodeIdByKind(nodes, 'agent'), type: 'kyrnVoiceEdge', data: { label: 'Apply context' } },
    { id: 'agent-end', source: nodeIdByKind(nodes, 'agent'), target: nodeIdByKind(nodes, 'end'), type: 'kyrnVoiceEdge', data: { label: 'End call' } },
  ].filter((edge) => edge.source && edge.target), [nodes]);
  const nodeTypes = useMemo(() => ({ kyrnVoiceNode: KyrnReactFlowNode }), []);
  const edgeTypes = useMemo(() => ({ kyrnVoiceEdge: KyrnReactFlowEdge }), []);

  return (
    <div className="flex h-screen min-h-[780px] flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#252525] bg-[#1a1a1a] px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-semibold">{agent.name}</h1>
          <Pencil className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex items-center gap-3">
          <VoiceButton variant="ghost"><RefreshCw className="h-4 w-4" /> v1 (Published)</VoiceButton>
          {unsaved && <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300">Unsaved changes</span>}
          <VoiceButton variant="ghost"><Phone className="h-4 w-4" /> Phone Call</VoiceButton>
          <VoiceButton variant="ghost" onClick={onRun}><Bot className="h-4 w-4" /> Test Agent</VoiceButton>
          <VoiceButton onClick={() => onSaveWorkflow(false)} className="bg-[#0f8f85] text-white hover:bg-[#0b746c]"><Save className="h-4 w-4" /> Save</VoiceButton>
          <VoiceButton variant="ghost" onClick={() => onSaveWorkflow(true)}>Publish</VoiceButton>
          <MoreVertical className="h-5 w-5 text-zinc-400" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[#050505]">
          <div className="absolute right-4 top-4 z-10 space-y-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900"><Plus className="h-5 w-5" /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] bg-[#181818] text-zinc-200"><Settings2 className="h-5 w-5" /></button>
          </div>
          <ReactFlow
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.35}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            className="kyrn-react-flow"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#285066" />
            <Controls className="!bottom-6 !left-8 !top-auto !border-[#373737] !bg-[#181818] !text-zinc-200" />
          </ReactFlow>
          <div className="absolute bottom-6 left-8 flex gap-2">
            {[Plus, RefreshCw, Globe2, Upload].map((Icon, index) => (
              <button key={index} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#373737] bg-[#181818] text-zinc-200">
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <aside className="relative w-[420px] shrink-0 border-l border-[#252525] bg-[#080808] p-4">
          <button className="absolute right-6 top-5 text-zinc-400"><X className="h-4 w-4" /></button>
          <div className="mb-8 grid grid-cols-2 rounded-lg bg-[#171717] p-1">
            <button onClick={() => setTestMode('audio')} className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'audio' ? 'bg-[#2b2b2b] text-white shadow-inner' : 'text-zinc-400'}`}>
              <Mic className="mr-2 inline h-4 w-4" /> Test Audio
            </button>
            <button onClick={() => setTestMode('chat')} className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'chat' ? 'bg-[#2b2b2b] text-white shadow-inner' : 'text-zinc-400'}`}>
              <MessageSquare className="mr-2 inline h-4 w-4" /> Test Chat
            </button>
          </div>
          <div className="flex h-[calc(100%-4rem)] flex-col rounded-xl border border-[#202020] bg-[#050505] p-5">
            {!testRunning && !testEnded ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-700/60 text-zinc-200"><Phone className="h-6 w-6" /></div>
                <h2 className="font-bold">Call this agent in the browser</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">Test the agent over a voice call. Some telephony-only tools, like call transfer, are not yet supported here.</p>
                <VoiceButton onClick={onRun} className="mt-6"><Phone className="h-4 w-4" /> Run Test</VoiceButton>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-bold"><MessageSquare className="mr-2 inline h-4 w-4" /> Live Transcript</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${testEnded ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/15 text-emerald-300'}`}>{testEnded ? 'Ended' : 'Live'}</span>
                </div>
                <div className="mb-6 flex justify-center"><span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-xs text-blue-300">start call</span></div>
                <p className="mb-2 text-xs text-zinc-400">
                  {runtimeSession?.session?.roomName ? `Room: ${runtimeSession.session.roomName}` : 'Preparing runtime session...'}
                </p>
                <div className="space-y-3 overflow-auto pr-1">
                  {testTranscript.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`rounded-xl border p-4 text-sm ${
                      message.role === 'assistant'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                        : message.role === 'user'
                          ? 'border-blue-500/40 bg-blue-500/10 text-blue-100'
                          : 'border-zinc-700 bg-[#202020] text-zinc-300'
                    }`}>
                      <span className="mb-1 block text-[11px] uppercase tracking-wide text-zinc-500">{message.role}</span>
                      {message.content}
                    </div>
                  ))}
                  {testTranscript.length === 0 && (
                    <div className="rounded-xl border border-zinc-500 bg-[#202020] p-4 text-sm text-zinc-200">
                      Hi there, I'm your Voice AI Agent. How can I help you today?
                    </div>
                  )}
                  <p className="mt-3 text-xs italic text-zinc-500">{testEnded ? 'completed' : 'speaking...'}</p>
                </div>
                <div className="mt-auto">
                  <p className="mb-4 text-center text-sm font-semibold text-emerald-400">{testEnded ? 'Ended' : 'Connected'}</p>
                  <button onClick={onRun} className={`w-full rounded-md px-4 py-3 text-sm font-semibold ${testEnded ? 'bg-zinc-200 text-zinc-900' : 'bg-red-500/80 text-white'}`}>
                    {testEnded ? <RefreshCw className="mr-2 inline h-4 w-4" /> : <Phone className="mr-2 inline h-4 w-4" />}
                    {testEnded ? 'Start Another Test' : 'End Call'}
                  </button>
                </div>
              </div>
            )}
          </div>
          {firstCallTip && (
            <div className="absolute bottom-28 right-32 w-96 rounded-lg bg-blue-500 p-6 text-white shadow-2xl">
              <button onClick={() => setFirstCallTip(false)} className="absolute right-4 top-4"><X className="h-4 w-4" /></button>
              <h3 className="text-lg font-bold">Try Your First Web Call</h3>
              <p className="mt-4 text-sm leading-6">Start a browser call here to hear the agent, inspect the transcript, and validate the workflow before you customize it further.</p>
              <div className="mt-6 text-right"><button onClick={() => setFirstCallTip(false)} className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-600">Close</button></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function KyrnReactFlowNode({ data, selected }: any) {
  const node = data.node as FlowNode;
  const nodeIndex = nodeSeeds.findIndex((item) => item.id === node.id);
  return (
    <div className={`relative w-[300px] rounded-lg border bg-[#171717] text-left shadow-xl transition ${selected ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-[#303030]'}`}>
      {node.kind !== 'start' && <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      {node.kind !== 'end' && node.kind !== 'global' && <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      {node.kind === 'agent' && <Handle type="target" position={Position.Left} id="left" className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      <div className="border-b border-[#2b2b2b] px-4 py-3">
        <span className={`mb-2 inline-flex rounded px-2 py-1 text-[10px] font-semibold ${nodeTone[node.kind]}`}>{node.badge}</span>
        <h3 className="text-sm font-bold text-white">{node.title} <span className="ml-1 text-xs text-zinc-500">#{nodeIndex < 0 ? 0 : nodeIndex}</span></h3>
      </div>
      <div className="px-4 py-4">
        <p className="mb-2 text-xs text-zinc-400">Prompt:</p>
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-zinc-200">{node.prompt}</p>
      </div>
      {selected && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            data.onEdit(node);
          }}
          className="nodrag absolute -right-12 top-20 flex h-9 w-9 items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] text-zinc-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function KyrnReactFlowEdge(props: any) {
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
      <BaseEdge path={edgePath} style={{ stroke: '#8792a5', strokeWidth: 2, strokeDasharray: '5 6' }} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute rounded-full bg-amber-500 px-3 py-1 text-[10px] font-semibold text-black"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {props.data?.label || 'Continue'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function WorkflowNode({ node, selected, onSelect, onEdit }: { node: FlowNode; selected: boolean; onSelect: () => void; onEdit: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`absolute w-[300px] rounded-lg border bg-[#171717] text-left shadow-xl transition ${selected ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-[#303030]'}`}
      style={{ left: node.x, top: node.y }}
    >
      <div className="border-b border-[#2b2b2b] px-4 py-3">
        <span className={`mb-2 inline-flex rounded px-2 py-1 text-[10px] font-semibold ${nodeTone[node.kind]}`}>{node.badge}</span>
        <h3 className="text-sm font-bold text-white">{node.title} <span className="ml-1 text-xs text-zinc-500">#{nodeSeeds.findIndex((item) => item.id === node.id)}</span></h3>
      </div>
      <div className="px-4 py-4">
        <p className="mb-2 text-xs text-zinc-400">Prompt:</p>
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-zinc-200">{node.prompt}</p>
      </div>
      {selected && (
        <span onClick={(event) => { event.stopPropagation(); onEdit(); }} className="absolute -right-12 top-20 flex h-9 w-9 items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] text-zinc-200">
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
        throw new Error('Invalid workflow data structure');
      }
      await onCreate({
        name: parsed.name || `WF-${Date.now()}`,
        description: 'Imported from a Dograh-compatible agent definition.',
        systemPrompt: extractPromptFromWorkflow(workflow),
        channelMode: 'whatsapp_voice',
        isDefaultForWhatsapp: true,
        metadata: {
          importedFrom: 'dograh_json',
          workflowDefinition: workflow,
        },
      });
    } catch {
      setError('Failed to upload workflow. Please check if the JSON file is valid.');
    }
  }

  return (
    <SmallDialog title="Upload Agent Definition" description="Drag and drop a Dograh-compatible Workflow JSON file, or click to select." onClose={onClose}>
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
        <p className="mb-4 text-sm text-zinc-400">Drag and drop your Workflow JSON File here, or click to select</p>
        <input
          id="workflow-upload"
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <VoiceButton variant="ghost" onClick={() => document.getElementById('workflow-upload')?.click()} disabled={busy}>Select File</VoiceButton>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </SmallDialog>
  );
}

function FolderDialog({ form, setForm, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Create New Folder" description="Group active voice agents into a folder, matching Dograh's workflow organization." onClose={onClose}>
      <VoiceField label="Folder Name">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Sales agents" className={inputClass} />
      </VoiceField>
      <DialogActions busy={false} onClose={onClose} onCreate={onCreate} createLabel="Create Folder" disabled={!form.name} />
    </SmallDialog>
  );
}

function AgentCreateDialog({ step, error, form, setForm, onClose, onCreate, onOpen }: any) {
  if (step === 'creating') {
    return (
      <ModalShell>
        <div className="w-[448px] rounded-lg border border-[#363636] bg-[#181818] p-10 text-center shadow-2xl">
          <Loader2 className="mx-auto mb-8 h-16 w-16 animate-spin text-zinc-200" />
          <h2 className="text-lg font-bold">Creating Your Workflow</h2>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-zinc-400">We're setting up your voice agent with your specifications. This will just take a moment...</p>
        </div>
      </ModalShell>
    );
  }
  if (step === 'success') {
    return (
      <ModalShell>
        <div className="relative w-[512px] rounded-lg border border-[#303030] bg-[#101010] p-6 shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-zinc-400"><X className="h-4 w-4" /></button>
          <h2 className="flex items-center gap-3 text-lg font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Workflow Created Successfully!</h2>
          <div className="mt-6 space-y-4 text-sm leading-6 text-zinc-400">
            <p>A voice agent workflow has been generated for your use case, with sample actions and editable workflow nodes.</p>
            <p>The voice bot is pre-set to communicate clearly and can be used in WhatsApp or standalone voice calls.</p>
            <p>Next step: test the voice bot in the editor, then customize it to match your process.</p>
          </div>
          <VoiceButton onClick={onOpen} className="mt-8 w-full justify-center">Open and Test Agent</VoiceButton>
        </div>
      </ModalShell>
    );
  }
  return (
    <ModalShell plain>
      <CenteredPage>
        <div className="w-full max-w-[640px]">
          <h1 className="text-3xl font-bold">Create Voice Agent</h1>
          <p className="mt-2 text-zinc-400">Tell us about your use case and we'll create a customized voice agent for you</p>
          <div className="mt-7 rounded-lg border border-[#303030] bg-[#171717] p-6">
            <h2 className="text-xl font-bold">Agent Details</h2>
            <p className="mt-1 text-sm text-zinc-400">Configure your voice agent settings</p>
            <div className="mt-6 space-y-6">
              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}
              <VoiceField label="Call Type" help="Choose whether users will call your AI or your AI will call users">
                <NativeSelect value={form.callType} onChange={(value) => setForm({ ...form, callType: value })}>
                  <option value="inbound">Inbound (Users call AI)</option>
                  <option value="outbound">Outbound (AI calls users)</option>
                  <option value="both">Inbound and Outbound</option>
                </NativeSelect>
              </VoiceField>
              <VoiceField label="Use Case" help="Describe the primary purpose of your voice agent">
                <Input value={form.useCase} onChange={(event) => setForm({ ...form, useCase: event.target.value })} placeholder="e.g. Appointment booking" className={inputClass} />
              </VoiceField>
              <VoiceField label="Activity Description" help="This description will be used to generate the AI prompt for your voice agent">
                <Textarea value={form.activityDescription} onChange={(event) => setForm({ ...form, activityDescription: event.target.value })} rows={5} placeholder="Describe what this agent should do..." className={inputClass} />
              </VoiceField>
              <VoiceButton onClick={onCreate} disabled={!form.useCase || !form.activityDescription} className="w-full justify-center">Create Agent</VoiceButton>
            </div>
          </div>
        </div>
      </CenteredPage>
    </ModalShell>
  );
}

function NodeDialog({ node, onClose, onSave }: { node: FlowNode; onClose: () => void; onSave: (node: FlowNode) => void }) {
  const [draft, setDraft] = useState(node);
  return (
    <ModalShell plain>
      <div className="mx-auto mt-16 max-h-[86vh] w-[min(1200px,calc(100vw-64px))] overflow-auto rounded-lg border border-[#303030] bg-[#080808] p-6 shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit {node.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">Configure the settings for this node in your workflow.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-300">Docs</span>
            <button onClick={onClose}><X className="h-5 w-5 text-zinc-400" /></button>
          </div>
        </div>
        <div className="space-y-5">
          <VoiceField label="Name *" help="Short identifier shown in the canvas and call logs.">
            <Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClass} />
          </VoiceField>
          <VoiceField label="Greeting Type" help="Whether the optional greeting is spoken via TTS from text or played from a pre-recorded audio file.">
            <NativeSelect value="tts" onChange={() => {}}><option value="tts">Text (TTS)</option><option value="audio">Audio Recording</option></NativeSelect>
          </VoiceField>
          <VoiceField label="Greeting Text" help="Text spoken via TTS at the start of the call. Supports {{template_variables}}.">
            <Textarea value="Hi {{first_name}}, this is Sarah from Acme." onChange={() => {}} rows={3} className={inputClass} />
          </VoiceField>
          <VoiceField label="Prompt *" help="Agent system prompt for this step. Supports {{template_variables}} from pre-call fetch and the initial context.">
            <Textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} rows={12} className={`${inputClass} font-mono text-sm`} />
          </VoiceField>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Toggle checked={false} onChange={() => {}} />
            Allow Interruption
            <span className="font-normal text-zinc-500">When true, the user can interrupt the agent mid-utterance.</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <VoiceButton variant="ghost" onClick={onClose}>Cancel</VoiceButton>
            <VoiceButton onClick={() => onSave(draft)}>Save Node</VoiceButton>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function TelephonyDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Add telephony configuration" description="Connect a telephony provider account. Phone numbers are added after the configuration is created." onClose={onClose}>
      <VoiceField label="Name">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Twilio US prod" className={inputClass} />
      </VoiceField>
      <VoiceField label="Provider">
        <NativeSelect value={form.provider} onChange={(value) => setForm({ ...form, provider: value })}>
          <option value="twilio">Twilio</option>
          <option value="asterisk_ari">Asterisk ARI</option>
          <option value="sip">SIP Provider</option>
        </NativeSelect>
      </VoiceField>
      <div className="rounded-md border border-[#303030] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Set as default for outbound calls</p>
            <p className="text-xs text-zinc-500">Used by test calls and campaigns when no specific config is selected.</p>
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
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Create" disabled={!form.name} />
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
    <SmallDialog title="Create New Tool" description="Create a new tool that can be used in your workflows." onClose={onClose}>
      <VoiceField label="Tool Type" help="Make HTTP requests to external APIs">
        <NativeSelect value={form.category} onChange={(value) => setForm({ ...form, category: value })}>
          <option value="http_api">External HTTP API</option>
          <option value="end_call">End Call</option>
          <option value="transfer_call">Transfer Call</option>
          <option value="calculator">Calculator</option>
        </NativeSelect>
      </VoiceField>
      <VoiceField label="Tool Name" help='Use a descriptive name, like "Book Appointment".'>
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g., Book Appointment, Check Inventory" className={inputClass} />
      </VoiceField>
      <VoiceField label="Description (Optional)" help="Provide a description that makes it easy for the LLM to understand what this tool does">
        <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What does this tool do?" className={inputClass} />
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
        <VoiceField label="Transfer number" help="The phone number or SIP target the caller should be transferred to.">
          <Input value={form.transferNumber} onChange={(event) => setForm({ ...form, transferNumber: event.target.value })} placeholder="+31..." className={inputClass} />
        </VoiceField>
      )}
      {form.category === 'calculator' && (
        <VoiceField label="Default expression" help="Agents can override this with live variables during execution.">
          <Input value={form.expression} onChange={(event) => setForm({ ...form, expression: event.target.value })} placeholder="subtotal * 1.21" className={inputClass} />
        </VoiceField>
      )}
      {form.category === 'end_call' && (
        <div className={`rounded-xl p-4 text-sm leading-6 ${voiceSoftPanelClass} ${voicePageMuted}`}>
          This built-in action lets the agent close the call after a final summary or goodbye message.
        </div>
      )}
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Create Tool" disabled={!canCreateTool} />
    </SmallDialog>
  );
}

function FileDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Upload Document" description="Upload a PDF or document file to add to your knowledge base" onClose={onClose}>
      <DropZone title="Drop your document here" subtitle="Supported formats: .pdf, .docx, .doc, .txt, .json (Max 5MB)" />
      <VoiceField label="Document Name">
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Choose File" className={inputClass} />
      </VoiceField>
      <VoiceField label="Extracted Text">
        <Textarea value={form.contentText} onChange={(event) => setForm({ ...form, contentText: event.target.value })} rows={4} placeholder="Optional document text for retrieval..." className={inputClass} />
      </VoiceField>
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Upload Document" disabled={!form.name} />
    </SmallDialog>
  );
}

function RecordingDialog({ form, setForm, busy, onClose, onCreate }: any) {
  return (
    <SmallDialog title="Upload Recordings" description="Upload or record audio files. Use @ in prompt fields to insert them into your agents." onClose={onClose}>
      <VoiceField label="Audio Files">
        <div className="flex gap-2">
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Choose audio files (max 5MB each)" className={inputClass} />
          <VoiceButton variant="ghost"><Mic className="h-4 w-4" /> Record</VoiceButton>
        </div>
      </VoiceField>
      <VoiceField label="Language">
        <NativeSelect value={form.language} onChange={(value) => setForm({ ...form, language: value })}>
          <option value="auto">Multilingual (Auto-detect)</option>
          <option value="nl">Dutch</option>
          <option value="en">English</option>
        </NativeSelect>
      </VoiceField>
      <VoiceField label="Transcript">
        <Textarea value={form.transcript} onChange={(event) => setForm({ ...form, transcript: event.target.value })} rows={3} className={inputClass} />
      </VoiceField>
      <DialogActions busy={busy} onClose={onClose} onCreate={onCreate} createLabel="Upload Recording" disabled={!form.name} />
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

function Toggle({ checked, onChange, ariaLabel = 'Toggle setting' }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
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
      <VoiceButton variant="ghost" onClick={onClose}>Cancel</VoiceButton>
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
        <VoiceButton variant="ghost"><EyeOff className="h-4 w-4" /> Show Archived</VoiceButton>
        <VoiceButton><Plus className="h-4 w-4" /> {button}</VoiceButton>
      </div>
      <div className="space-y-4">
        {(keys.length ? keys : [{ id: 'default', name: 'Default API Key', createdAt: new Date().toISOString(), lastUsedAt: null }]).map((key: any) => (
          <div key={key.id} className="rounded-lg border border-zinc-200 p-4 dark:border-[#303030]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{key.name || 'Default API Key'}</h3>
                  <Badge className="bg-zinc-100 text-zinc-900">Active</Badge>
                </div>
                <p className={`mt-3 font-mono text-sm ${voicePageMuted}`}><span className="rounded bg-[#0000170b] px-3 py-2 dark:bg-[#252525]">{prefix}</span> <span className="ml-2 text-xs">(Full key hidden for security)</span></p>
                <p className={`mt-4 text-xs ${voicePageMuted}`}>Created: {formatDate(key.createdAt)} - Last used: {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}</p>
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
      { id: 'elevenlabs', name: 'ElevenLabs', description: 'Low-latency premium voices' },
      { id: 'minimax', name: 'MiniMax', description: 'Expressive multilingual TTS' },
      { id: 'qwen', name: 'Qwen TTS', description: 'Realtime voice stack' },
      { id: 'chatterbox', name: 'Chatterbox', description: 'Open-source voice cloning' },
    ];
  }
  if (tab === 'transcriber') {
    return [
      { id: 'deepgram', name: 'Deepgram', description: 'Fast streaming STT' },
      { id: 'openai', name: 'OpenAI', description: 'General transcription' },
      { id: 'qwen', name: 'Qwen ASR', description: 'Realtime ASR slot' },
    ];
  }
  return [
    { id: 'openai', name: 'OpenAI', description: 'General reasoning and tools' },
    { id: 'qwen', name: 'Qwen', description: 'Realtime and multilingual agent models' },
    { id: 'minimax', name: 'MiniMax', description: 'Voice-agent friendly model stack' },
    { id: 'xiaomi-mimo', name: 'Xiaomi MiMo', description: 'Experimental provider slot' },
  ];
}

function providerCapability(provider: string, tab: string) {
  if (provider.includes('eleven')) return 'Premium voice synthesis';
  if (provider.includes('mini')) return 'Multilingual voice and LLM provider';
  if (provider.includes('qwen')) return 'Realtime speech and LLM stack';
  if (provider.includes('chatterbox')) return 'Open-source voice clone service';
  if (tab === 'embedding') return 'Knowledge retrieval embeddings';
  return 'Configurable voice-agent provider';
}

function modelOptionsForProvider(provider: string, tab: string) {
  if (tab === 'voice') {
    if (provider === 'elevenlabs') return ['eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_flash_v2_5'];
    if (provider === 'minimax') return ['speech-02-hd', 'speech-02-turbo', 'speech-01-turbo'];
    if (provider === 'qwen') return ['qwen-tts-realtime', 'qwen-tts'];
    if (provider === 'chatterbox') return ['chatterbox-multilingual', 'chatterbox-turbo'];
    return ['gpt-4o-mini-tts', 'default'];
  }
  if (tab === 'transcriber') {
    if (provider === 'deepgram') return ['nova-3', 'nova-2', 'base'];
    if (provider === 'qwen') return ['qwen-asr-realtime', 'qwen-asr'];
    return ['gpt-4o-mini-transcribe', 'whisper-1', 'default'];
  }
  if (tab === 'embedding') return ['text-embedding-3-large', 'text-embedding-3-small', 'qwen-text-embedding'];
  if (provider === 'qwen') return ['qwen3-235b-a22b', 'qwen3-32b', 'qwen-realtime'];
  if (provider === 'minimax') return ['abab6.5s-chat', 'MiniMax-Text-01'];
  if (provider === 'xiaomi-mimo') return ['mimo-experimental'];
  return ['gpt-4o-mini', 'gpt-4o', 'gpt-4o-realtime-preview'];
}

function fallbackVoices() {
  return [
    { id: 'kyrn-hope', name: 'Hope', provider: 'ElevenLabs', style: 'upbeat and clear' },
    { id: 'kyrn-jasper', name: 'Jasper', provider: 'MiniMax', style: 'calm sales assistant' },
    { id: 'kyrn-nova', name: 'Nova', provider: 'Chatterbox', style: 'cloned brand voice' },
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
      name: 'Demo follow-up',
      description: 'Call warm leads, confirm fit, and book the next meeting.',
      concurrency: 4,
    },
    {
      id: 'reactivation',
      name: 'Reactivation',
      description: 'Re-engage older leads with a short low-pressure call.',
      concurrency: 3,
    },
    {
      id: 'appointment-reminder',
      name: 'Appointment reminder',
      description: 'Confirm bookings and collect reschedule requests.',
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
  return `# MAIN ACTION POINT AT THIS STAGE
You are the Kyrn voice agent for: ${useCase}.

Call type: ${callType}.

Activity description:
${activityDescription}

Greet the user naturally, collect the important details, use available tools and files when needed, and keep every response short enough for a live voice or WhatsApp conversation.`;
}

function buildWorkflowPayload(agent: any, nodes: FlowNode[]) {
  const startId = nodeIdByKind(nodes, 'start');
  const globalId = nodeIdByKind(nodes, 'global');
  const agentId = nodeIdByKind(nodes, 'agent');
  const endId = nodeIdByKind(nodes, 'end');

  return {
    name: agent.name || 'Kyrn Voice Agent',
    version: 1,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: flowKindToWorkflowType(node.kind),
      position: { x: node.x, y: node.y },
      data: {
        name: node.title,
        prompt: node.prompt,
        allowInterruptions: true,
        waitForUserResponse: node.kind === 'agent',
      },
    })),
    edges: [
      { id: 'edge-start-agent', source: startId, target: agentId, label: 'Move to Main Agenda' },
      { id: 'edge-global-agent', source: globalId, target: agentId, label: 'Apply context' },
      { id: 'edge-agent-end', source: agentId, target: endId, label: 'End call' },
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

function definitionToFlowNodes(definition: any): FlowNode[] {
  const workflowNodes = Array.isArray(definition.nodes) ? definition.nodes : [];
  if (!workflowNodes.length) return nodeSeeds;

  return workflowNodes.map((node: any, index: number) => {
    const kind = workflowTypeToFlowKind(node.type);
    const fallback = nodeSeeds.find((seed) => seed.kind === kind) || nodeSeeds[Math.min(index, nodeSeeds.length - 1)];
    return {
      id: node.id || fallback.id,
      kind,
      title: node.data?.name || fallback.title,
      badge: fallback.badge,
      prompt: node.data?.prompt || fallback.prompt,
      x: node.position?.x ?? fallback.x,
      y: node.position?.y ?? fallback.y,
    };
  });
}

function flowKindToWorkflowType(kind: FlowNode['kind']) {
  if (kind === 'start') return 'startCall';
  if (kind === 'global') return 'globalNode';
  if (kind === 'end') return 'endCall';
  return 'agentNode';
}

function workflowTypeToFlowKind(type: string): FlowNode['kind'] {
  if (type === 'startCall') return 'start';
  if (type === 'globalNode') return 'global';
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
  return data.prompt || data.systemPrompt || data.instructions || 'Imported Dograh workflow. Follow the workflow definition and keep responses concise.';
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const inputClass = 'border-zinc-200 bg-white text-[hsl(240_1.7%_11.2%)] placeholder:text-zinc-400 focus-visible:ring-cyan-500 dark:border-[#3a3a3a] dark:bg-[#222] dark:text-white dark:placeholder:text-zinc-500';
