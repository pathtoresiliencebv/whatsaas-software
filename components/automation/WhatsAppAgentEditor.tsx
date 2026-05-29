'use client';

import '@xyflow/react/dist/style.css';

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  type Connection,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Smartphone,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { saveAutomation } from '@/app/[locale]/(dashboard)/automation/actions';

type AutomationEditorData = {
  id: number;
  name: string;
  triggerKeyword: string | null;
  isActive: boolean;
  instanceLabel: string;
  nodes: unknown;
  edges: unknown;
};

type WhatsAppNodeData = Record<string, unknown> & {
  kind: 'start' | 'condition' | 'message' | 'handoff' | 'end';
  title: string;
  badge: string;
  prompt: string;
  onEdit?: (nodeId: string) => void;
};

type AddMenuState = {
  x: number;
  y: number;
  flowX: number;
  flowY: number;
  sourceNodeId?: string;
} | null;

const nodeTone: Record<WhatsAppNodeData['kind'], string> = {
  start: 'border-[#35c45f]/70 text-[#78df94]',
  condition: 'border-amber-500/70 text-amber-300',
  message: 'border-blue-500/70 text-blue-300',
  handoff: 'border-violet-500/70 text-violet-300',
  end: 'border-rose-500/70 text-rose-300',
};

const starterNodes: Node<WhatsAppNodeData>[] = [
  {
    id: 'start',
    type: 'whatsappAgentNode',
    position: { x: 420, y: 80 },
    data: {
      kind: 'start',
      title: 'Binnenkomende WhatsApp',
      badge: 'Startstap',
      prompt: 'Er komt een nieuw WhatsApp-bericht binnen in deze automatisering. Lees de chatcontext en kies de beste volgende reactie.',
    },
  },
  {
    id: 'qualify',
    type: 'whatsappAgentNode',
    position: { x: 740, y: 360 },
    data: {
      kind: 'message',
      title: 'Kwalificeren en antwoorden',
      badge: 'Agentstap',
      prompt: 'Stel een nuttige vraag, verzamel de klantbehoefte en antwoord met een warm en kort WhatsApp-bericht.',
    },
  },
  {
    id: 'global',
    type: 'whatsappAgentNode',
    position: { x: 110, y: 360 },
    data: {
      kind: 'condition',
      title: 'Algemene regels',
      badge: 'Globale stap',
      prompt: 'Blijf in merkstijl, houd antwoorden kort, gebruik beschikbare klantvelden en verzin nooit ontbrekende bestel- of betaalgegevens.',
    },
  },
  {
    id: 'handoff',
    type: 'whatsappAgentNode',
    position: { x: 430, y: 650 },
    data: {
      kind: 'handoff',
      title: 'Overdragen aan mens',
      badge: 'Actiestap',
      prompt: 'Als de klant om een medewerker vraagt, markeer de chat voor opvolging en schrijf een korte overdrachtssamenvatting.',
    },
  },
];

const starterEdges: Edge[] = [
  { id: 'start-qualify', source: 'start', target: 'qualify', type: 'whatsappAgentEdge', data: { label: 'Antwoorden' } },
  { id: 'start-handoff', source: 'start', target: 'handoff', type: 'whatsappAgentEdge', data: { label: 'Escaleren' } },
  { id: 'qualify-handoff', source: 'qualify', target: 'handoff', type: 'whatsappAgentEdge', data: { label: 'Mens nodig' } },
];

export function WhatsAppAgentEditor({ automation }: { automation: AutomationEditorData }) {
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, startSaving] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('start');
  const [editNode, setEditNode] = useState<Node<WhatsAppNodeData> | null>(null);
  const [addMenu, setAddMenu] = useState<AddMenuState>(null);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node<WhatsAppNodeData>, Edge> | null>(null);
  const [testMode, setTestMode] = useState<'chat' | 'preview'>('chat');
  const [testRunning, setTestRunning] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WhatsAppNodeData>>(normalizeNodes(automation.nodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(normalizeEdges(automation.edges));

  const nodeTypes = useMemo(() => ({ whatsappAgentNode: WhatsAppReactFlowNode }), []);
  const edgeTypes = useMemo(() => ({ whatsappAgentEdge: WhatsAppReactFlowEdge }), []);
  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          onEdit: (nodeId: string) => {
            const currentNode = nodes.find((item) => item.id === nodeId);
            if (currentNode) setEditNode(currentNode);
          },
        },
      })),
    [nodes, selectedNodeId]
  );

  function updateNode(nextNode: Node<WhatsAppNodeData>) {
    setNodes((current) =>
      current.map((node) =>
        node.id === nextNode.id
          ? { ...node, data: { ...node.data, title: nextNode.data.title, prompt: nextNode.data.prompt, kind: nextNode.data.kind, badge: nextNode.data.badge } }
          : node
      )
    );
    setDirty(true);
    setEditNode(null);
  }

  function openAddMenuAt(clientX: number, clientY: number, sourceNodeId?: string) {
    const bounds = flowWrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const fallbackPosition = { x: clientX - bounds.left, y: clientY - bounds.top };
    const flowPosition = flowInstance?.screenToFlowPosition({ x: clientX, y: clientY }) || fallbackPosition;
    setAddMenu({
      x: Math.min(Math.max(clientX - bounds.left, 12), bounds.width - 230),
      y: Math.min(Math.max(clientY - bounds.top, 12), bounds.height - 280),
      flowX: flowPosition.x,
      flowY: flowPosition.y,
      sourceNodeId,
    });
  }

  function openAddMenuNearSelected() {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const bounds = flowWrapperRef.current?.getBoundingClientRect();
    if (!bounds || !selectedNode) {
      openAddMenuAt(window.innerWidth / 2, window.innerHeight / 2, selectedNodeId);
      return;
    }
    const nextPosition = {
      x: selectedNode.position.x + 360,
      y: selectedNode.position.y + 160,
    };
    const screenPosition = flowInstance?.flowToScreenPosition(nextPosition);
    if (screenPosition) {
      openAddMenuAt(screenPosition.x, screenPosition.y, selectedNode.id);
      return;
    }
    setAddMenu({
      x: Math.min(Math.max(selectedNode.position.x + 360, 12), bounds.width - 230),
      y: Math.min(Math.max(selectedNode.position.y + 160, 12), bounds.height - 280),
      flowX: nextPosition.x,
      flowY: nextPosition.y,
      sourceNodeId: selectedNode.id,
    });
  }

  function handleCanvasContextMenu(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, input, textarea, select, a, .react-flow__controls, .nodrag')) return;
    event.preventDefault();
    const nodeElement = target?.closest('.react-flow__node') as HTMLElement | null;
    const nodeId = nodeElement?.dataset.id;
    if (nodeId) setSelectedNodeId(nodeId);
    openAddMenuAt(event.clientX, event.clientY, nodeId);
  }

  function addNode(kind: WhatsAppNodeData['kind'], position?: { x: number; y: number }, sourceNodeId?: string) {
    const source = sourceNodeId || addMenu?.sourceNodeId || selectedNodeId;
    const existingIds = new Set(nodes.map((node) => node.id));
    const idBase = `${kind}-${Date.now().toString(36)}`;
    let id = idBase;
    let index = 1;
    while (existingIds.has(id)) {
      id = `${idBase}-${index}`;
      index += 1;
    }
    const newNode: Node<WhatsAppNodeData> = {
      id,
      type: 'whatsappAgentNode',
      position: position || { x: addMenu?.flowX || 320, y: addMenu?.flowY || 220 },
      data: {
        kind,
        title: titleForKind(kind),
        badge: badgeForKind(kind),
        prompt: promptForKind(kind),
      },
    };

    setNodes((current) => [...current, newNode]);
    if (source && source !== id && kind !== 'start') {
      const sourceNode = nodes.find((node) => node.id === source);
      if (sourceNode && sourceNode.data.kind !== 'end') {
        setEdges((current) => [
          ...current,
          {
            id: `${source}-${id}`,
            source,
            target: id,
            type: 'whatsappAgentEdge',
            data: { label: edgeLabelForKind(kind) },
          },
        ]);
      }
    }
    setSelectedNodeId(id);
    setAddMenu(null);
    setDirty(true);
  }

  function addTemplate(template: 'lead' | 'support' | 'booking') {
    const source = addMenu?.sourceNodeId || selectedNodeId;
    const sourceNode = nodes.find((node) => node.id === source) || nodes[0];
    const startPosition = {
      x: addMenu?.flowX ?? (sourceNode?.position.x || 240) + 360,
      y: addMenu?.flowY ?? (sourceNode?.position.y || 160) + 120,
    };
    const timestamp = Date.now().toString(36);
    const templates: Record<typeof template, Array<Pick<Node<WhatsAppNodeData>, 'position'> & { kind: WhatsAppNodeData['kind']; title: string; prompt: string; label: string }>> = {
      lead: [
        {
          kind: 'message',
          title: 'Lead kwalificeren',
          label: 'Kwalificeren',
          position: startPosition,
          prompt: 'Vraag wat de klant wil bereiken, verzamel naam, bedrijf en gewenste vervolgstap. Houd het antwoord kort en warm.',
        },
        {
          kind: 'condition',
          title: 'Klaar voor demo?',
          label: 'Gekwalificeerd',
          position: { x: startPosition.x + 360, y: startPosition.y + 180 },
          prompt: 'Controleer of de klant een duidelijke use-case, timing en interesse in een demo heeft. Stuur onduidelijke chats terug naar een verduidelijkende vraag.',
        },
        {
          kind: 'handoff',
          title: 'Overdracht aan sales',
          label: 'Boeken / overdracht',
          position: { x: startPosition.x + 720, y: startPosition.y + 320 },
          prompt: 'Vat de lead samen, voeg de hot-lead tag toe en wijs het gesprek met de verzamelde details toe aan sales.',
        },
      ],
      support: [
        {
          kind: 'message',
          title: 'Probleem triageren',
          label: 'Triage',
          position: startPosition,
          prompt: 'Vraag naar account, probleem, urgentie en indien nuttig een screenshot of voorbeeld. Stel de klant gerust.',
        },
        {
          kind: 'condition',
          title: 'Oplossen of escaleren',
          label: 'Urgentie',
          position: { x: startPosition.x + 360, y: startPosition.y + 180 },
          prompt: 'Is het probleem simpel, antwoord dan met de volgende stap. Gaat het om facturatie, storing of toegang, escaleer dan naar een teamlid.',
        },
        {
          kind: 'handoff',
          title: 'Overdracht aan support',
          label: 'Escaleren',
          position: { x: startPosition.x + 720, y: startPosition.y + 320 },
          prompt: 'Maak een korte supportsamenvatting met klant, probleem, urgentie en geprobeerde stappen. Pauzeer daarna de automatisering.',
        },
      ],
      booking: [
        {
          kind: 'message',
          title: 'Boekingswens verzamelen',
          label: 'Boeking',
          position: startPosition,
          prompt: 'Vraag wat de klant wil plannen, de gewenste dag/tijd, tijdzone en contactgegevens.',
        },
        {
          kind: 'condition',
          title: 'Boekingsdetails compleet?',
          label: 'Details compleet',
          position: { x: startPosition.x + 360, y: startPosition.y + 180 },
          prompt: 'Controleer of datum, tijd, contactgegevens en doel duidelijk zijn. Vraag anders een ontbrekend detail tegelijk.',
        },
        {
          kind: 'message',
          title: 'Afspraak bevestigen',
          label: 'Bevestigen',
          position: { x: startPosition.x + 720, y: startPosition.y + 320 },
          prompt: 'Bevestig de voorgestelde afspraakdetails en vertel dat een teamlid opvolgt als handmatige bevestiging nodig is.',
        },
      ],
    };

    const newNodes = templates[template].map((item, index) => ({
      id: `${template}-${timestamp}-${index}`,
      type: 'whatsappAgentNode',
      position: item.position,
      data: {
        kind: item.kind,
        title: item.title,
        badge: badgeForKind(item.kind),
        prompt: item.prompt,
      },
    })) satisfies Node<WhatsAppNodeData>[];

    const newEdges: Edge[] = [];
    if (sourceNode && sourceNode.data.kind !== 'end') {
      newEdges.push({
        id: `${source}-${newNodes[0].id}`,
        source,
        target: newNodes[0].id,
        type: 'whatsappAgentEdge',
        data: { label: templates[template][0].label },
      });
    }
    for (let index = 0; index < newNodes.length - 1; index += 1) {
      newEdges.push({
        id: `${newNodes[index].id}-${newNodes[index + 1].id}`,
        source: newNodes[index].id,
        target: newNodes[index + 1].id,
        type: 'whatsappAgentEdge',
        data: { label: templates[template][index + 1].label },
      });
    }

    setNodes((current) => [...current, ...newNodes]);
    setEdges((current) => [...current, ...newEdges]);
    setSelectedNodeId(newNodes[0].id);
    setAddMenu(null);
    setDirty(true);
  }

  function duplicateSelectedNode() {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode) return;
    const id = `${selectedNode.data.kind}-${Date.now().toString(36)}`;
    const copy: Node<WhatsAppNodeData> = {
      ...selectedNode,
      id,
      selected: false,
      position: {
        x: selectedNode.position.x + 340,
        y: selectedNode.position.y + 120,
      },
      data: {
        ...selectedNode.data,
        title: `${selectedNode.data.title} kopie`,
      },
    };
    setNodes((current) => [...current, copy]);
    if (selectedNode.data.kind !== 'end') {
      setEdges((current) => [
        ...current,
        {
          id: `${selectedNode.id}-${id}`,
          source: selectedNode.id,
          target: id,
          type: 'whatsappAgentEdge',
          data: { label: 'Kopie' },
        },
      ]);
    }
    setSelectedNodeId(id);
    setAddMenu(null);
    setDirty(true);
  }

  function deleteSelectedNode() {
    if (!selectedNodeId || selectedNodeId === 'start') return;
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId('start');
    setAddMenu(null);
    setDirty(true);
  }

  function connectNodes(connection: Connection) {
    if (!connection.source || !connection.target) return;
    setEdges((current) => [
      ...current.filter((edge) => !(edge.source === connection.source && edge.target === connection.target)),
      {
        id: `${connection.source}-${connection.target}-${Date.now().toString(36)}`,
        source: connection.source,
        target: connection.target,
        type: 'whatsappAgentEdge',
        data: { label: 'Doorgaan' },
      },
    ]);
    setDirty(true);
  }

  function save() {
    const serializableNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data.kind,
      position: node.position,
      data: {
        label: node.data.title,
        title: node.data.title,
        kind: node.data.kind,
        badge: node.data.badge,
        prompt: node.data.prompt,
        message: node.data.prompt,
      },
    }));
    const serializableEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge.data || {},
      type: 'workflow',
    }));

    startSaving(async () => {
      await saveAutomation(automation.id, serializableNodes, serializableEdges);
      setDirty(false);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1600);
    });
  }

  function runTest() {
    setTestRunning((value) => !value);
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'm') addNode('message', getOffsetPosition(nodes, selectedNodeId, 360, 160), selectedNodeId);
      if (key === 'c') addNode('condition', getOffsetPosition(nodes, selectedNodeId, 0, 260), selectedNodeId);
      if (key === 'h') addNode('handoff', getOffsetPosition(nodes, selectedNodeId, 360, 300), selectedNodeId);
      if (key === 'e') addNode('end', getOffsetPosition(nodes, selectedNodeId, 0, 360), selectedNodeId);
      if (key === 'd') duplicateSelectedNode();
      if (event.key === 'Delete' || event.key === 'Backspace') deleteSelectedNode();
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [nodes, selectedNodeId]);

  return (
    <div className="flex h-screen min-h-[780px] flex-col overflow-hidden bg-[#050705] text-white">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#202820] bg-[#151a16] px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/automation" className="text-zinc-400 transition hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{automation.name}</h1>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
              <Smartphone className="h-3.5 w-3.5" />
              {automation.instanceLabel}
            </p>
          </div>
          <Pencil className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex items-center gap-3">
          <ToolbarButton muted><RefreshCw className="h-4 w-4" /> v1 concept</ToolbarButton>
          {dirty && <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300">Niet opgeslagen</span>}
          {savedFlash && <span className="rounded-md border border-[#35c45f]/40 bg-[#35c45f]/10 px-3 py-2 text-sm font-semibold text-[#78df94]">Opgeslagen</span>}
          <ToolbarButton muted onClick={runTest}><Bot className="h-4 w-4" /> Agent testen</ToolbarButton>
          <ToolbarButton onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </ToolbarButton>
          <MoreVertical className="h-5 w-5 text-zinc-400" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div ref={flowWrapperRef} onContextMenu={handleCanvasContextMenu} className="relative min-w-0 flex-1 overflow-hidden bg-[#050505]">
          <div className="absolute right-4 top-4 z-[60] space-y-2">
            <button
              type="button"
              onClick={openAddMenuNearSelected}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 shadow-lg"
              title="Workflowstap toevoegen"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#303832] bg-[#151a16] text-zinc-200">
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-5 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-[#303832] bg-[#151a16]/95 p-2 text-zinc-200 shadow-2xl shadow-black/30 backdrop-blur">
            <span className="px-2 text-xs font-semibold text-zinc-400">Toevoegen aan flow</span>
            <PaletteButton title="Bericht" onClick={() => addNode('message', getOffsetPosition(nodes, selectedNodeId, 360, 160), selectedNodeId)}>
              <MessageSquare className="h-4 w-4" />
            </PaletteButton>
            <PaletteButton title="Voorwaarde" onClick={() => addNode('condition', getOffsetPosition(nodes, selectedNodeId, 0, 260), selectedNodeId)}>
              <Zap className="h-4 w-4" />
            </PaletteButton>
            <PaletteButton title="Overdracht aan mens" onClick={() => addNode('handoff', getOffsetPosition(nodes, selectedNodeId, 360, 300), selectedNodeId)}>
              <Bot className="h-4 w-4" />
            </PaletteButton>
            <PaletteButton title="Chat beeindigen" onClick={() => addNode('end', getOffsetPosition(nodes, selectedNodeId, 0, 360), selectedNodeId)}>
              <CheckCircle2 className="h-4 w-4" />
            </PaletteButton>
            <button
              type="button"
              onClick={openAddMenuNearSelected}
              className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-xl bg-[#35c45f] px-3 text-xs font-bold text-[#041208] transition hover:bg-[#2daf53]"
            >
              <Plus className="h-4 w-4" />
              Meer
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-[#303832] bg-[#111611]/90 px-4 py-2 text-xs font-medium text-zinc-400 shadow-xl backdrop-blur">
            Klik op de toolbar of gebruik rechtermuisknop op het canvas om stappen toe te voegen.
          </div>

          <ReactFlow
            nodes={decoratedNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={setFlowInstance}
            fitView
            minZoom={0.35}
            maxZoom={1.35}
            proOptions={{ hideAttribution: true }}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              if (changes.some((change) => change.type !== 'dimensions' && change.type !== 'select')) {
                setDirty(true);
              }
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              if (changes.some((change) => change.type !== 'select')) {
                setDirty(true);
              }
            }}
            onConnect={connectNodes}
            onPaneClick={() => setAddMenu(null)}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              openAddMenuAt(event.clientX, event.clientY);
            }}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onNodeDoubleClick={(_, node) => setEditNode(node as Node<WhatsAppNodeData>)}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              setSelectedNodeId(node.id);
              openAddMenuAt(event.clientX, event.clientY, node.id);
            }}
            onEdgeContextMenu={(event, edge) => {
              event.preventDefault();
              setSelectedNodeId(edge.source);
              openAddMenuAt(event.clientX, event.clientY, edge.source);
            }}
            onNodeDragStop={() => setDirty(true)}
            className="kyrn-whatsapp-flow"
          >
            <Background variant={BackgroundVariant.Dots} gap={13} size={1} color="#244b31" />
            <Controls className="!bottom-24 !left-8 !top-auto !border-[#333d35] !bg-[#151a16] !text-zinc-200" />
          </ReactFlow>

          <div className="absolute bottom-6 left-8 z-[60] flex gap-2 rounded-xl border border-[#303832] bg-[#151a16]/90 p-1.5 shadow-xl backdrop-blur">
            <CanvasButton title="Stap toevoegen" onClick={openAddMenuNearSelected}><Plus className="h-4 w-4" /></CanvasButton>
            <CanvasButton title="Voorwaarde toevoegen" onClick={() => addNode('condition', getOffsetPosition(nodes, selectedNodeId, 0, 260), selectedNodeId)}><Zap className="h-4 w-4" /></CanvasButton>
            <CanvasButton title="Antwoord toevoegen" onClick={() => addNode('message', getOffsetPosition(nodes, selectedNodeId, 360, 160), selectedNodeId)}><RefreshCw className="h-4 w-4" /></CanvasButton>
            <CanvasButton title="Selectie verwijderen" onClick={deleteSelectedNode} disabled={selectedNodeId === 'start'}><Trash2 className="h-4 w-4" /></CanvasButton>
          </div>

          {addMenu && (
            <AddNodeMenu
              menu={addMenu}
              selectedNodeId={selectedNodeId}
              onAdd={(kind) => addNode(kind, { x: addMenu.flowX, y: addMenu.flowY }, addMenu.sourceNodeId)}
              onTemplate={addTemplate}
              onDuplicate={duplicateSelectedNode}
              onEdit={() => {
                const currentNode = nodes.find((node) => node.id === selectedNodeId);
                if (currentNode) setEditNode(currentNode);
                setAddMenu(null);
              }}
              onDelete={deleteSelectedNode}
              onClose={() => setAddMenu(null)}
            />
          )}
        </div>

        <aside className="relative w-[410px] shrink-0 border-l border-[#202820] bg-[#080a08] p-4">
          <div className="mb-8 grid grid-cols-2 rounded-lg bg-[#141814] p-1">
            <button
              onClick={() => setTestMode('chat')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'chat' ? 'bg-[#252b26] text-white shadow-inner' : 'text-zinc-400'}`}
            >
              <MessageSquare className="mr-2 inline h-4 w-4" /> Testchat
            </button>
            <button
              onClick={() => setTestMode('preview')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${testMode === 'preview' ? 'bg-[#252b26] text-white shadow-inner' : 'text-zinc-400'}`}
            >
              <Bot className="mr-2 inline h-4 w-4" /> Agentvoorbeeld
            </button>
          </div>

          <div className="flex h-[calc(100%-4rem)] flex-col rounded-xl border border-[#1f261f] bg-[#050705] p-5">
            {!testRunning ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#35c45f]/15 text-[#35c45f]">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h2 className="font-bold">Test deze WhatsApp-agent</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Draai een browserchatsimulatie om het antwoord, het flowpad en overdrachtgedrag te controleren voordat je de agent met WhatsApp verbindt.
                </p>
                <ToolbarButton onClick={runTest} className="mt-6"><Play className="h-4 w-4" /> Test starten</ToolbarButton>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-bold"><MessageSquare className="mr-2 inline h-4 w-4" /> Live testchat</h2>
                  <span className="rounded-full bg-[#35c45f]/15 px-3 py-1 text-xs font-semibold text-[#78df94]">Live</span>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-zinc-800 px-4 py-3 text-zinc-100">
                    Hoi, ik wil graag meer weten over jullie dienst.
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#35c45f]/30 bg-[#0f2114] px-4 py-3 text-zinc-100">
                    Bedankt voor je bericht. Ik help je graag. Wat wil je als eerste automatiseren: support, sales of opvolging?
                    <p className="mt-2 text-xs text-[#78df94]">WhatsApp-agent</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="mb-4 text-center text-sm font-semibold text-[#78df94]">Verbonden</p>
                  <button onClick={runTest} className="w-full rounded-md bg-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-950">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    Test afronden
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {editNode && <NodeDialog node={editNode} onClose={() => setEditNode(null)} onSave={updateNode} />}
    </div>
  );
}

function WhatsAppReactFlowNode({ id, data, selected }: NodeProps<Node<WhatsAppNodeData>>) {
  return (
    <div className={`relative w-[306px] rounded-lg border bg-[#151815] text-left shadow-xl transition ${selected ? 'border-[#35c45f] ring-1 ring-[#35c45f]' : 'border-[#303830]'}`}>
      {data.kind !== 'start' && <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      {data.kind !== 'end' && <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-0 !bg-slate-400" />}
      <div className="border-b border-[#2a312b] px-4 py-3">
        <span className={`mb-2 inline-flex rounded border px-2 py-1 text-[10px] font-semibold ${nodeTone[data.kind]}`}>{data.badge}</span>
        <h3 className="text-sm font-bold text-white">{data.title}</h3>
      </div>
      <div className="px-4 py-4">
        <p className="mb-2 text-xs text-zinc-400">Instructie:</p>
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-zinc-200">{data.prompt}</p>
      </div>
      {selected && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            data.onEdit?.(id);
          }}
          className="nodrag absolute -right-12 top-20 flex h-9 w-9 items-center justify-center rounded-lg border border-[#3a433b] bg-[#1b211c] text-zinc-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function WhatsAppReactFlowEdge(props: any) {
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
      <BaseEdge path={edgePath} style={{ stroke: '#7b8d81', strokeWidth: 2, strokeDasharray: '5 6' }} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute rounded-full bg-[#35c45f] px-3 py-1 text-[10px] font-semibold text-[#041208]"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {props.data?.label || 'Doorgaan'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function NodeDialog({ node, onClose, onSave }: { node: Node<WhatsAppNodeData>; onClose: () => void; onSave: (node: Node<WhatsAppNodeData>) => void }) {
  const [draft, setDraft] = useState(node);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/70 px-8 py-12 backdrop-blur-sm">
      <div className="w-[min(960px,calc(100vw-64px))] rounded-xl border border-[#303830] bg-[#080a08] p-6 shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{node.data.title} bewerken</h2>
            <p className="mt-1 text-sm text-zinc-400">Configureer deze WhatsApp-workflowstap.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5">
          <Field label="Naam">
            <input value={draft.data.title} onChange={(event) => setDraft({ ...draft, data: { ...draft.data, title: event.target.value } })} className={inputClass} />
          </Field>
          <Field label="Staptype">
            <select
              value={draft.data.kind}
              onChange={(event) => {
                const kind = event.target.value as WhatsAppNodeData['kind'];
                setDraft({ ...draft, data: { ...draft.data, kind, badge: badgeForKind(kind) } });
              }}
              className={inputClass}
            >
              <option value="start">Start</option>
              <option value="condition">Voorwaarde / globaal</option>
              <option value="message">Berichtagent</option>
              <option value="handoff">Overdracht aan mens</option>
              <option value="end">Einde</option>
            </select>
          </Field>
          <Field label="Instructie">
            <textarea
              value={draft.data.prompt}
              onChange={(event) => setDraft({ ...draft, data: { ...draft.data, prompt: event.target.value } })}
              rows={12}
              className={`${inputClass} min-h-[260px] resize-none font-mono text-sm`}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-4">
            <ToolbarButton muted onClick={onClose}>Annuleren</ToolbarButton>
            <ToolbarButton onClick={() => onSave(draft)}>Stap opslaan</ToolbarButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  muted,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        muted
          ? 'border-[#333d35] bg-[#151a16] text-zinc-200 hover:bg-[#202720]'
          : 'border-[#35c45f] bg-[#35c45f] text-[#041208] hover:bg-[#2daf53]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function CanvasButton({
  children,
  title,
  onClick,
  disabled,
}: {
  children: ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#333d35] bg-[#151a16] text-zinc-200 transition hover:bg-[#202720] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PaletteButton({ children, title, onClick }: { children: ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={`${title} toevoegen`}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#303832] bg-[#0d110e] text-zinc-200 transition hover:border-[#35c45f]/60 hover:bg-[#35c45f]/10 hover:text-[#78df94]"
    >
      {children}
      <span className="sr-only">{title} toevoegen</span>
    </button>
  );
}

function AddNodeMenu({
  menu,
  selectedNodeId,
  onAdd,
  onTemplate,
  onDuplicate,
  onEdit,
  onDelete,
  onClose,
}: {
  menu: NonNullable<AddMenuState>;
  selectedNodeId: string;
  onAdd: (kind: WhatsAppNodeData['kind']) => void;
  onTemplate: (template: 'lead' | 'support' | 'booking') => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const items: Array<{ kind: WhatsAppNodeData['kind']; title: string; description: string; icon: ReactNode }> = [
    { kind: 'message', title: 'Berichtagent', description: 'Verstuur of schrijf een WhatsApp-antwoord', icon: <MessageSquare className="h-4 w-4" /> },
    { kind: 'condition', title: 'Voorwaarde', description: 'Routeer op intentie, tag of veld', icon: <Zap className="h-4 w-4" /> },
    { kind: 'handoff', title: 'Overdracht aan mens', description: 'Wijs toe aan een teamlid', icon: <Bot className="h-4 w-4" /> },
    { kind: 'end', title: 'Chat beeindigen', description: 'Sluit dit automatiseringspad', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div
      className="absolute z-[80] w-[232px] overflow-hidden rounded-xl border border-[#303830] bg-[#111611] p-2 text-white shadow-2xl"
      style={{ left: menu.x, top: menu.y }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="mb-1 flex items-center justify-between px-2 py-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Stap toevoegen</p>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.kind}
            type="button"
            aria-label={`${item.title} toevoegen via contextmenu`}
            onClick={() => onAdd(item.kind)}
            className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[#35c45f]/10"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#35c45f]/12 text-[#78df94]">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="block text-xs leading-5 text-zinc-400">{item.description}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 border-t border-[#252d26] pt-2">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Snelle flows</p>
        <button type="button" onClick={() => onTemplate('lead')} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-[#35c45f]/10 hover:text-white">
          Leadkwalificatie <span className="text-xs text-zinc-500">3 stappen</span>
        </button>
        <button type="button" onClick={() => onTemplate('support')} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-[#35c45f]/10 hover:text-white">
          Supporttriage <span className="text-xs text-zinc-500">3 stappen</span>
        </button>
        <button type="button" onClick={() => onTemplate('booking')} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-[#35c45f]/10 hover:text-white">
          Boekingsflow <span className="text-xs text-zinc-500">3 stappen</span>
        </button>
      </div>
      <div className="mt-2 border-t border-[#252d26] pt-2">
        <button type="button" onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-white/5">
          <Plus className="h-4 w-4" /> Selectie dupliceren
        </button>
        <button type="button" onClick={onEdit} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-white/5">
          <Pencil className="h-4 w-4" /> Selectie bewerken
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={selectedNodeId === 'start'}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" /> Selectie verwijderen
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">{label}</span>
      {children}
    </label>
  );
}

function normalizeNodes(value: unknown): Node<WhatsAppNodeData>[] {
  const rawNodes = Array.isArray(value) && value.length ? value : starterNodes;
  return rawNodes.map((raw: any, index) => {
    const rawKind = raw?.data?.kind || raw?.kind || raw?.type || 'message';
    const kind = normalizeKind(rawKind, index);
    return {
      id: String(raw?.id || `node-${index}`),
      type: 'whatsappAgentNode',
      position: raw?.position || { x: Number(raw?.x || 180 + index * 280), y: Number(raw?.y || 180) },
      data: {
        kind,
        title: raw?.data?.title || raw?.data?.label || raw?.title || titleForKind(kind),
        badge: raw?.data?.badge || badgeForKind(kind),
        prompt: raw?.data?.prompt || raw?.data?.message || raw?.prompt || promptForKind(kind),
      },
    };
  });
}

function normalizeEdges(value: unknown): Edge[] {
  const rawEdges = Array.isArray(value) && value.length ? value : starterEdges;
  return rawEdges.map((edge: any, index) => ({
    id: String(edge?.id || `edge-${index}`),
    source: String(edge?.source || 'start'),
    target: String(edge?.target || 'qualify'),
    type: 'whatsappAgentEdge',
    data: { label: edge?.data?.label || edge?.label || 'Doorgaan' },
  }));
}

function normalizeKind(kind: string, index: number): WhatsAppNodeData['kind'] {
  if (kind === 'start') return 'start';
  if (kind === 'condition' || kind === 'global') return 'condition';
  if (kind === 'handoff' || kind === 'action') return 'handoff';
  if (kind === 'end') return 'end';
  return index === 0 ? 'start' : 'message';
}

function badgeForKind(kind: WhatsAppNodeData['kind']) {
  if (kind === 'start') return 'Startstap';
  if (kind === 'condition') return 'Globale stap';
  if (kind === 'handoff') return 'Actiestap';
  if (kind === 'end') return 'Eindstap';
  return 'Agentstap';
}

function titleForKind(kind: WhatsAppNodeData['kind']) {
  if (kind === 'start') return 'Binnenkomende WhatsApp';
  if (kind === 'condition') return 'Algemene regels';
  if (kind === 'handoff') return 'Overdragen aan mens';
  if (kind === 'end') return 'Chat sluiten';
  return 'Kwalificeren en antwoorden';
}

function promptForKind(kind: WhatsAppNodeData['kind']) {
  if (kind === 'start') return 'Er komt een nieuw WhatsApp-bericht binnen. Lees de chatcontext en kies de volgende stap.';
  if (kind === 'condition') return 'Pas teamregels, tone of voice, tags en klantcontext toe voordat je antwoordt.';
  if (kind === 'handoff') return 'Escaleren naar een teamlid met een korte samenvatting wanneer de chat handmatige aandacht nodig heeft.';
  if (kind === 'end') return 'Sluit het gesprek netjes af en geef de klant een duidelijke volgende stap.';
  return 'Schrijf een behulpzaam WhatsApp-antwoord en stel een gerichte vervolgvraag.';
}

function edgeLabelForKind(kind: WhatsAppNodeData['kind']) {
  if (kind === 'condition') return 'Controleren';
  if (kind === 'handoff') return 'Escaleren';
  if (kind === 'end') return 'Einde';
  return 'Doorgaan';
}

function getOffsetPosition(nodes: Node<WhatsAppNodeData>[], selectedNodeId: string, xOffset: number, yOffset: number) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || nodes[0];
  return {
    x: (selectedNode?.position.x || 240) + xOffset,
    y: (selectedNode?.position.y || 160) + yOffset,
  };
}

const inputClass =
  'w-full rounded-lg border border-[#343d35] bg-[#151a16] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#35c45f] focus:ring-2 focus:ring-[#35c45f]/20';
