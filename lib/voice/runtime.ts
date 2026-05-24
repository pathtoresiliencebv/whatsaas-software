import { calculateVoiceCredits } from './credits';

export type VoiceRuntimeChannel = 'browser' | 'phone' | 'whatsapp' | 'api';

export type VoiceRuntimeSession = {
  teamId: number;
  agentId: number;
  runId: number;
  channel: VoiceRuntimeChannel;
  roomName: string;
  transport: 'livekit' | 'twilio-streams' | 'text';
  pipeline: Array<'stt' | 'workflow' | 'llm' | 'tools' | 'rag' | 'tts'>;
  runtimeProvider: 'pipecat-livekit';
};

export type RuntimeUsage = {
  durationSeconds?: number;
  llmTokens?: number;
  sttSeconds?: number;
  ttsCharacters?: number;
  ttsAudioSeconds?: number;
  telephonySeconds?: number;
};

export type VoiceRuntimeEvent =
  | { type: 'run.started'; at?: string }
  | { type: 'run.ended'; at?: string; status?: 'completed' | 'failed' | 'cancelled'; error?: string }
  | { type: 'transcript.user' | 'transcript.agent'; text: string; at?: string }
  | { type: 'tool.called'; name: string; input?: any; output?: any; at?: string }
  | { type: 'recording.ready'; recordingUrl: string; durationSeconds?: number; at?: string }
  | { type: 'usage'; usage: RuntimeUsage; at?: string };

export type RuntimeRunState = {
  messages: any[];
  transcript: string;
  usage: RuntimeUsage;
  events?: VoiceRuntimeEvent[];
  status?: string;
  error?: string | null;
};

export function buildRuntimeSession(params: {
  teamId: number;
  agentId: number;
  runId: number;
  channel: VoiceRuntimeChannel;
}): VoiceRuntimeSession {
  return {
    ...params,
    roomName: `kyrn-voice-team-${params.teamId}-agent-${params.agentId}-run-${params.runId}`,
    transport: params.channel === 'whatsapp' || params.channel === 'api' ? 'text' : 'livekit',
    pipeline: ['stt', 'workflow', 'llm', 'tools', 'tts'],
    runtimeProvider: 'pipecat-livekit',
  };
}

export function reduceRuntimeEvent(state: RuntimeRunState, event: VoiceRuntimeEvent): RuntimeRunState {
  const events = [...(state.events || []), event];
  const next: RuntimeRunState = {
    ...state,
    events,
    messages: [...(state.messages || [])],
    usage: { ...(state.usage || {}) },
  };

  if (event.type === 'transcript.user' || event.type === 'transcript.agent') {
    const role = event.type === 'transcript.user' ? 'user' : 'assistant';
    const label = role === 'user' ? 'User' : 'Agent';
    next.messages.push({ role, content: event.text, at: event.at || new Date().toISOString() });
    next.transcript = [state.transcript, `${label}: ${event.text}`].filter(Boolean).join('\n');
  }

  if (event.type === 'usage') {
    next.usage = { ...next.usage, ...event.usage };
  }

  if (event.type === 'run.ended') {
    next.status = event.status || 'completed';
    next.error = event.error || null;
  }

  return next;
}

export function summarizeRunUsage(usage: RuntimeUsage) {
  const durationCredits = calculateVoiceCredits({ durationSeconds: usage.durationSeconds || usage.telephonySeconds || 0 });
  const llmCredits = Math.ceil((usage.llmTokens || 0) / 2000);
  const ttsCredits = Math.ceil((usage.ttsCharacters || 0) / 1000);
  const sttCredits = usage.sttSeconds ? calculateVoiceCredits({ durationSeconds: usage.sttSeconds }) : 0;
  const totalCredits = Math.max(1, durationCredits + llmCredits + ttsCredits + sttCredits);

  return {
    durationCredits,
    llmCredits,
    ttsCredits,
    sttCredits,
    totalCredits,
  };
}
