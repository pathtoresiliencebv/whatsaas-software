import type { VoiceRuntimeSession } from './runtime';

export type RuntimeEnvironment = Partial<Record<string, string | undefined>>;

export type RealtimeRuntimeConfig = {
  livekitUrl: string | null;
  livekitApiKey: string | null;
  livekitApiSecret: string | null;
  livekitConfigured: boolean;
  callbacksConfigured: boolean;
  agentName: string;
  publicBaseUrl: string | null;
  websocketBaseUrl: string | null;
  runtimeSecret: string | null;
};

export type PipecatWorkerConfig = {
  runtime: 'pipecat-livekit';
  transport: 'livekit' | 'twilio-media-streams';
  session: VoiceRuntimeSession;
  livekit: {
    url: string | null;
    roomName: string;
    agentName: string;
  };
  callbacks: {
    eventsUrl: string | null;
    runtimeSecret: string | null;
  };
  audio: {
    inputSampleRate: number;
    outputSampleRate: number;
    encoding: 'pcm_s16le';
  };
  providers: {
    stt: string;
    sttModel?: string;
    llm: string;
    llmModel?: string;
    tts: string;
    ttsModel?: string;
    ttsVoice?: string | null;
    credentials?: {
      llmApiKey?: string | null;
      sttApiKey?: string | null;
      ttsApiKey?: string | null;
    };
  };
  workflow?: Record<string, any>;
  variables: Record<string, any>;
};

export function getRealtimeRuntimeConfig(env: RuntimeEnvironment = process.env): RealtimeRuntimeConfig {
  const livekitUrl = trimEnv(env.LIVEKIT_URL);
  const livekitApiKey = trimEnv(env.LIVEKIT_API_KEY);
  const livekitApiSecret = trimEnv(env.LIVEKIT_API_SECRET);
  const publicBaseUrl = firstEnv(env.NEXT_PUBLIC_APP_URL, env.BASE_URL, env.NEXT_PUBLIC_WEBHOOK_URL);
  const websocketBaseUrl = firstEnv(env.PIPECAT_WEBSOCKET_BASE_URL, publicBaseUrl || undefined);

  return {
    livekitUrl,
    livekitApiKey,
    livekitApiSecret,
    livekitConfigured: Boolean(livekitUrl && livekitApiKey && livekitApiSecret),
    callbacksConfigured: Boolean(publicBaseUrl),
    agentName: trimEnv(env.PIPECAT_AGENT_NAME) || 'kyrn-pipecat',
    publicBaseUrl,
    websocketBaseUrl,
    runtimeSecret: trimEnv(env.VOICE_RUNTIME_SECRET),
  };
}

export function buildLiveKitAgentMetadata(params: {
  session: VoiceRuntimeSession;
  agentName?: string;
  callbackBaseUrl?: string | null;
  workflow?: Record<string, any> | null;
  variables?: Record<string, any>;
}) {
  const callbackBaseUrl = normalizeHttpBaseUrl(params.callbackBaseUrl || undefined);
  return JSON.stringify({
    runtime: 'pipecat-livekit',
    transport: 'livekit',
    agentName: params.agentName || 'kyrn-pipecat',
    teamId: params.session.teamId,
    agentId: params.session.agentId,
    runId: params.session.runId,
    roomName: params.session.roomName,
    callbackUrl: callbackBaseUrl ? `${callbackBaseUrl}/api/voice/runtime/events` : null,
    workflow: params.workflow || null,
    variables: params.variables || {},
  });
}

export function buildPipecatWorkerConfig(params: {
  session: VoiceRuntimeSession;
  livekitUrl?: string | null;
  agentName?: string;
  callbackBaseUrl?: string | null;
  runtimeSecret?: string | null;
  workflow?: Record<string, any> | null;
  variables?: Record<string, any>;
  transport?: 'livekit' | 'twilio-media-streams';
  providers?: Partial<PipecatWorkerConfig['providers']>;
}): PipecatWorkerConfig {
  const callbackBaseUrl = normalizeHttpBaseUrl(params.callbackBaseUrl || undefined);
  return {
    runtime: 'pipecat-livekit',
    transport: params.transport || 'livekit',
    session: params.session,
    livekit: {
      url: params.livekitUrl || null,
      roomName: params.session.roomName,
      agentName: params.agentName || 'kyrn-pipecat',
    },
    callbacks: {
      eventsUrl: callbackBaseUrl ? `${callbackBaseUrl}/api/voice/runtime/events` : null,
      runtimeSecret: params.runtimeSecret || null,
    },
    audio: {
      inputSampleRate: 16000,
      outputSampleRate: 24000,
      encoding: 'pcm_s16le',
    },
    providers: {
      stt: 'deepgram',
      sttModel: 'nova-3',
      llm: 'gemini-live',
      llmModel: 'gemini-3.1-flash-live-preview',
      tts: 'google-chirp',
      ttsModel: 'chirp-3-hd',
      ...params.providers,
    },
    workflow: params.workflow || undefined,
    variables: params.variables || {},
  };
}

export function buildTwilioMediaStreamTwiML(params: {
  websocketBaseUrl: string;
  session: VoiceRuntimeSession;
  callSid?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const wsBase = normalizeWebsocketBaseUrl(params.websocketBaseUrl);
  const streamUrl = `${wsBase}/api/voice/runtime/twilio-media`;
  const values: Record<string, string | number> = {
    teamId: params.session.teamId,
    agentId: params.session.agentId,
    runId: params.session.runId,
    roomName: params.session.roomName,
  };
  if (params.callSid) values.callSid = params.callSid;
  if (params.from) values.from = params.from;
  if (params.to) values.to = params.to;

  return xmlResponse(`  <Connect>
    <Stream url="${escapeXml(streamUrl)}">
${Object.entries(values)
  .map(([name, value]) => `      <Parameter name="${escapeXml(name)}" value="${escapeXml(String(value))}" />`)
  .join('\n')}
    </Stream>
  </Connect>`);
}

export function buildLiveKitSipTwiML(params: {
  sipHost: string;
  sipUsername: string;
  sipPassword: string;
  phoneNumber: string;
}) {
  const sipUri = `sip:${params.phoneNumber}@${params.sipHost};transport=tcp`;
  return xmlResponse(`  <Dial>
    <Sip username="${escapeXml(params.sipUsername)}" password="${escapeXml(params.sipPassword)}">${escapeXml(sipUri)}</Sip>
  </Dial>`);
}

export function normalizeWebsocketBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) return trimmed;
  if (trimmed.startsWith('https://')) return `wss://${trimmed.slice('https://'.length)}`;
  if (trimmed.startsWith('http://')) return `ws://${trimmed.slice('http://'.length)}`;
  return `wss://${trimmed}`;
}

export function normalizeHttpBaseUrl(value?: string) {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed || null;
}

function firstEnv(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const trimmed = trimEnv(value);
    if (trimmed) return trimmed;
  }
  return null;
}

function trimEnv(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function xmlResponse(inner: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${inner}
</Response>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
