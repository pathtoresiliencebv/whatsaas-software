export type VoiceProviderKind = 'llm' | 'stt' | 'tts' | 'realtime' | 'telephony';

export type VoiceProviderDescriptor = {
  id: string;
  name: string;
  kind: VoiceProviderKind;
  status: 'ready' | 'beta' | 'experimental';
  description: string;
  credentialFields: string[];
  defaultModel?: string;
  supportsStreaming?: boolean;
  supportsVoiceCloning?: boolean;
};

export type VoiceProviderCatalog = Record<VoiceProviderKind, VoiceProviderDescriptor[]>;

const catalog: VoiceProviderCatalog = {
  llm: [
    provider('gemini-live', 'Gemini 3.1 Flash Live', 'llm', 'beta', 'Google Gemini Live API for native low-latency audio conversations.', ['apiKey'], 'gemini-3.1-flash-live-preview', true),
    provider('openai', 'ChatGPT / OpenAI', 'llm', 'ready', 'OpenAI-compatible realtime and chat completions for assistant reasoning.', ['apiKey'], 'gpt-realtime-2', true),
    provider('gemini', 'Gemini', 'llm', 'beta', 'Google Gemini text and multimodal reasoning for agent fallback flows.', ['apiKey'], 'gemini-3.1-flash', true),
    provider('qwen', 'Qwen', 'llm', 'beta', 'DashScope/Qwen models for multilingual and realtime-capable agents.', ['apiKey'], 'qwen-plus', true),
    provider('minimax', 'MiniMax', 'llm', 'beta', 'MiniMax language models for speech-first agent stacks.', ['apiKey'], 'abab6.5s-chat', true),
    provider('xiaomi-mimo', 'Xiaomi MiMo', 'llm', 'experimental', 'Experimental slot for MiMo once official production API access is available.', ['apiKey'], 'mimo-v2', false),
  ],
  stt: [
    provider('deepgram', 'Deepgram', 'stt', 'ready', 'Low-latency streaming transcription for realtime calls.', ['apiKey'], 'nova-3', true),
    provider('openai', 'ChatGPT user transcript', 'stt', 'ready', 'OpenAI user transcription model for realtime caller transcripts.', ['apiKey'], 'gpt-realtime-whisper', true),
    provider('qwen-asr', 'Qwen ASR', 'stt', 'beta', 'DashScope realtime speech recognition over WebSocket.', ['apiKey'], 'qwen-asr-realtime', true),
  ],
  tts: [
    ttsProvider('elevenlabs', 'ElevenLabs', 'ready', 'Production-quality realtime and cloned voices.', ['apiKey'], 'eleven_flash_v2_5', true, true),
    ttsProvider('google-chirp', 'Google Chirp 3 HD', 'beta', 'Google Cloud Chirp 3 HD voices for premium natural speech.', ['apiKey', 'serviceAccountJson'], 'chirp-3-hd', true, false),
    ttsProvider('gemini-tts', 'Gemini 3.1 Flash TTS', 'beta', 'Gemini native TTS preview with prebuilt voices such as Kore and Puck.', ['apiKey'], 'gemini-3.1-flash-tts-preview', true, false),
    ttsProvider('minimax', 'MiniMax Speech', 'beta', 'Multilingual low-latency speech and cloning.', ['apiKey', 'groupId'], 'speech-02-turbo', true, true),
    ttsProvider('qwen', 'Qwen TTS', 'beta', 'DashScope realtime speech synthesis.', ['apiKey'], 'qwen3-tts-flash-realtime', true, false),
    ttsProvider('chatterbox', 'Chatterbox', 'beta', 'Resemble open-source TTS via the Resonance-style GPU service.', ['apiKey', 'baseUrl'], 'chatterbox-turbo', false, true),
    ttsProvider('openai', 'OpenAI TTS', 'ready', 'Fast fallback TTS for generated previews.', ['apiKey'], 'gpt-4o-mini-tts', true, false),
  ],
  realtime: [
    provider('pipecat-livekit', 'Pipecat + LiveKit', 'realtime', 'ready', 'Recommended Kyrn runtime transport for browser and SIP calls.', ['livekitUrl', 'livekitApiKey', 'livekitApiSecret'], 'pipecat-flow-v1', true),
    provider('gemini-live', 'Gemini 3.1 Flash Live', 'realtime', 'beta', 'Google Gemini Live API native audio session with low-latency speech-to-speech.', ['apiKey'], 'gemini-3.1-flash-live-preview', true),
    provider('openai-realtime', 'ChatGPT Realtime 2', 'realtime', 'beta', 'Requested ChatGPT realtime stack using gpt-realtime-2.', ['apiKey'], 'gpt-realtime-2', true),
    provider('qwen-omni-realtime', 'Qwen Omni Realtime', 'realtime', 'beta', 'Direct Qwen realtime audio/text sessions for experimental agents.', ['apiKey'], 'qwen3.5-omni-plus-realtime', true),
  ],
  telephony: [
    provider('twilio-livekit-sip', 'Twilio via LiveKit SIP', 'telephony', 'ready', 'Twilio phone numbers routed into LiveKit rooms.', ['accountSid', 'authToken', 'sipUsername', 'sipPassword'], 'twilio-sip', true),
    provider('twilio-media-streams', 'Twilio Media Streams', 'telephony', 'beta', 'Direct Twilio websocket media stream fallback.', ['accountSid', 'authToken'], 'twilio-streams', true),
  ],
};

export function getVoiceProviderCatalog(): VoiceProviderCatalog {
  return catalog;
}

export function getVoiceProviderDefaults() {
  return {
    llmProvider: 'gemini-live',
    llmModel: 'gemini-3.1-flash-live-preview',
    sttProvider: 'deepgram',
    sttModel: 'nova-3',
    ttsProvider: 'google-chirp',
    ttsModel: 'chirp-3-hd',
    realtimeProvider: 'gemini-live',
    telephonyProvider: 'twilio-livekit-sip',
  };
}

export function maskCredentialValue(value: string | null | undefined) {
  if (!value) return '';
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 4)}${'*'.repeat(Math.max(8, value.length - 7))}${value.slice(-3)}`;
}

function provider(
  id: string,
  name: string,
  kind: VoiceProviderKind,
  status: VoiceProviderDescriptor['status'],
  description: string,
  credentialFields: string[],
  defaultModel?: string,
  supportsStreaming = false,
): VoiceProviderDescriptor {
  return { id, name, kind, status, description, credentialFields, defaultModel, supportsStreaming };
}

function ttsProvider(
  id: string,
  name: string,
  status: VoiceProviderDescriptor['status'],
  description: string,
  credentialFields: string[],
  defaultModel: string,
  supportsStreaming: boolean,
  supportsVoiceCloning: boolean,
): VoiceProviderDescriptor {
  return {
    ...provider(id, name, 'tts', status, description, credentialFields, defaultModel, supportsStreaming),
    supportsVoiceCloning,
  };
}
