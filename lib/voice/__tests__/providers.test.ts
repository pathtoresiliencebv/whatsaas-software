import { describe, expect, it } from 'vitest';
import {
  getVoiceProviderCatalog,
  getVoiceProviderDefaults,
  maskCredentialValue,
} from '@/lib/voice/providers';

describe('voice provider catalog', () => {
  it('includes launch providers for LLM, STT, TTS, realtime, and experimental MiMo', () => {
    const catalog = getVoiceProviderCatalog();

    expect(catalog.llm.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['openai', 'qwen', 'minimax', 'xiaomi-mimo']),
    );
    expect(catalog.tts.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['elevenlabs', 'minimax', 'qwen', 'chatterbox', 'openai']),
    );
    expect(catalog.realtime.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['pipecat-livekit', 'qwen-omni-realtime']),
    );
  });

  it('returns stable defaults for a new agent model config', () => {
    expect(getVoiceProviderDefaults()).toMatchObject({
      llmProvider: 'openai',
      sttProvider: 'deepgram',
      ttsProvider: 'elevenlabs',
      realtimeProvider: 'pipecat-livekit',
    });
  });

  it('masks provider credentials without leaking short keys', () => {
    expect(maskCredentialValue('sk-1234567890')).toBe('sk-1********890');
    expect(maskCredentialValue('abc')).toBe('***');
    expect(maskCredentialValue('')).toBe('');
  });
});
