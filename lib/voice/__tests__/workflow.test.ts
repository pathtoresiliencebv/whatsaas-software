import { describe, expect, it } from 'vitest';
import {
  buildDefaultVoiceWorkflow,
  normalizeWorkflowDefinition,
  validateWorkflowDefinition,
} from '@/lib/voice/workflow';

describe('voice workflow definitions', () => {
  it('creates a valid Dograh-style default workflow from an agent brief', () => {
    const workflow = buildDefaultVoiceWorkflow({
      name: 'Appointment Setter',
      callType: 'inbound',
      useCase: 'Book demos',
      activityDescription: 'Qualify the caller and schedule a demo when they are ready.',
    });

    const result = validateWorkflowDefinition(workflow);

    expect(result.valid).toBe(true);
    expect(workflow.nodes.map((node) => node.type)).toEqual([
      'startCall',
      'globalNode',
      'agentNode',
      'endCall',
    ]);
    expect(workflow.edges).toHaveLength(3);
  });

  it('rejects workflows without a start node or with broken edges', () => {
    const result = validateWorkflowDefinition({
      nodes: [{ id: 'agent-1', type: 'agentNode', data: { name: 'Agent', prompt: 'Help.' } }],
      edges: [{ id: 'edge-1', source: 'missing', target: 'agent-1' }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workflow needs exactly one startCall node.');
    expect(result.errors).toContain('Edge edge-1 has an unknown source node.');
  });

  it('normalizes imported workflow data into nodes, edges, and metadata', () => {
    const workflow = normalizeWorkflowDefinition({
      name: 'Imported',
      workflow_definition: {
        nodes: [{ id: 'start', type: 'startCall', data: { prompt: 'Start' } }],
        edges: [],
      },
    });

    expect(workflow.name).toBe('Imported');
    expect(workflow.nodes[0].data.name).toBe('Start Call');
    expect(workflow.metadata?.source).toBe('dograh_import');
  });
});
