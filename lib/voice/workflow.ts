export type VoiceWorkflowNodeType =
  | 'startCall'
  | 'globalNode'
  | 'agentNode'
  | 'endCall'
  | 'trigger'
  | 'webhook'
  | 'qa';

export type VoiceWorkflowNode = {
  id: string;
  type: VoiceWorkflowNodeType;
  position?: { x: number; y: number };
  data: {
    name?: string;
    prompt?: string;
    greetingText?: string;
    allowInterruptions?: boolean;
    waitForUserResponse?: boolean;
    toolIds?: number[];
    fileIds?: number[];
    [key: string]: any;
  };
};

export type VoiceWorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  transitionSpeech?: string;
  [key: string]: any;
};

export type VoiceWorkflowDefinition = {
  name?: string;
  version?: number;
  nodes: VoiceWorkflowNode[];
  edges: VoiceWorkflowEdge[];
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
};

export type WorkflowValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const NODE_LABELS: Record<VoiceWorkflowNodeType, string> = {
  startCall: 'Start Call',
  globalNode: 'Global Node',
  agentNode: 'Agent Node',
  endCall: 'End Call',
  trigger: 'Trigger',
  webhook: 'Webhook',
  qa: 'QA',
};

export function buildDefaultVoiceWorkflow(params: {
  name: string;
  callType?: 'inbound' | 'outbound' | string;
  useCase?: string;
  activityDescription?: string;
}): VoiceWorkflowDefinition {
  const callType = params.callType || 'inbound';
  const useCase = params.useCase || params.name;
  const activity = params.activityDescription || 'Understand the user and help them complete the next step.';

  const nodes: VoiceWorkflowNode[] = [
    {
      id: 'start-call',
      type: 'startCall',
      position: { x: 420, y: 80 },
      data: {
        name: 'Start Call',
        greetingText: callType === 'outbound' ? 'Hi {{first_name}}, this is your Kyrn assistant.' : '',
        prompt: [
          '# MAIN ACTION POINT AT THIS STAGE',
          callType === 'outbound'
            ? 'You are starting an outbound call. Confirm the person is available before continuing.'
            : 'You have received an inbound call from a user. Greet the user naturally and ask how you can help.',
          `Use case: ${useCase}`,
        ].join('\n\n'),
        allowInterruptions: true,
      },
    },
    {
      id: 'global-context',
      type: 'globalNode',
      position: { x: 120, y: 330 },
      data: {
        name: 'Global Context',
        prompt: [
          '# OVERALL GOAL',
          activity,
          'Stay concise, helpful, and human. Use the connected tools and knowledge base only when needed.',
        ].join('\n\n'),
      },
    },
    {
      id: 'main-agenda',
      type: 'agentNode',
      position: { x: 720, y: 330 },
      data: {
        name: 'Main Agenda and Questions',
        prompt: [
          '# MAIN ACTION POINT AT THIS STEP',
          activity,
          'Identify the caller need, ask one focused question at a time, and move toward a clear outcome.',
        ].join('\n\n'),
        waitForUserResponse: true,
      },
    },
    {
      id: 'end-call',
      type: 'endCall',
      position: { x: 420, y: 620 },
      data: {
        name: 'End Call',
        prompt: 'Summarize the next step, thank the user, and end the call politely.',
      },
    },
  ];

  return {
    name: params.name,
    version: 1,
    nodes,
    edges: [
      { id: 'edge-start-main', source: 'start-call', target: 'main-agenda', label: 'Move to Main Agenda' },
      { id: 'edge-global-main', source: 'global-context', target: 'main-agenda', label: 'Apply context' },
      { id: 'edge-main-end', source: 'main-agenda', target: 'end-call', label: 'End call' },
    ],
    variables: {},
    metadata: {
      source: 'kyrn_default',
      callType,
      useCase,
    },
  };
}

export function normalizeWorkflowDefinition(input: any): VoiceWorkflowDefinition {
  const raw = input?.workflow_definition || input?.workflowJson || input?.definition || input || {};
  const nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const edges = Array.isArray(raw.edges) ? raw.edges : [];

  return {
    name: input?.name || raw.name,
    version: Number(raw.version || input?.version || 1),
    nodes: nodes.map(normalizeNode),
    edges: edges.map(normalizeEdge),
    variables: raw.variables && typeof raw.variables === 'object' ? raw.variables : {},
    metadata: {
      ...(raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {}),
      source: input?.workflow_definition ? 'dograh_import' : raw.metadata?.source || 'kyrn',
    },
  };
}

export function validateWorkflowDefinition(workflow: Pick<VoiceWorkflowDefinition, 'nodes' | 'edges'>): WorkflowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const edges = Array.isArray(workflow.edges) ? workflow.edges : [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const startNodes = nodes.filter((node) => node.type === 'startCall');
  const endNodes = nodes.filter((node) => node.type === 'endCall');

  if (startNodes.length !== 1) errors.push('Workflow needs exactly one startCall node.');
  if (endNodes.length === 0) warnings.push('Workflow has no endCall node.');

  nodes.forEach((node) => {
    if (!node.id) errors.push('Every node needs an id.');
    if (!node.type) errors.push(`Node ${node.id || '(unknown)'} needs a type.`);
    if (!node.data?.prompt && node.type !== 'trigger') {
      warnings.push(`Node ${node.id} has no prompt.`);
    }
  });

  edges.forEach((edge) => {
    if (!edge.source || !nodeIds.has(edge.source)) errors.push(`Edge ${edge.id || '(unknown)'} has an unknown source node.`);
    if (!edge.target || !nodeIds.has(edge.target)) errors.push(`Edge ${edge.id || '(unknown)'} has an unknown target node.`);
  });

  return { valid: errors.length === 0, errors, warnings };
}

function normalizeNode(node: any): VoiceWorkflowNode {
  const type = normalizeNodeType(node.type);
  const data = node.data && typeof node.data === 'object' ? node.data : {};
  return {
    id: String(node.id || `${type}-${cryptoSafeId()}`),
    type,
    position: node.position || { x: 0, y: 0 },
    data: {
      name: data.name || data.label || node.name || NODE_LABELS[type],
      prompt: data.prompt || node.prompt || '',
      ...data,
    },
  };
}

function normalizeEdge(edge: any): VoiceWorkflowEdge {
  return {
    id: String(edge.id || `edge-${cryptoSafeId()}`),
    source: String(edge.source || ''),
    target: String(edge.target || ''),
    label: edge.label || edge.data?.label,
    condition: edge.condition || edge.data?.condition,
    transitionSpeech: edge.transitionSpeech || edge.transition_speech,
  };
}

function normalizeNodeType(type: unknown): VoiceWorkflowNodeType {
  if (typeof type !== 'string') return 'agentNode';
  if (type in NODE_LABELS) return type as VoiceWorkflowNodeType;
  if (type === 'start') return 'startCall';
  if (type === 'end') return 'endCall';
  if (type === 'global') return 'globalNode';
  if (type === 'agent') return 'agentNode';
  return 'agentNode';
}

function cryptoSafeId() {
  return Math.random().toString(36).slice(2, 10);
}
