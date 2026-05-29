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
      expect.arrayContaining(['gemini-live', 'gemini', 'openai', 'qwen', 'minimax', 'xiaomi-mimo']),
    );
    expect(catalog.tts.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['google-chirp', 'gemini-tts', 'elevenlabs', 'minimax', 'qwen', 'chatterbox', 'openai']),
    );
    expect(catalog.realtime.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['gemini-live', 'openai-realtime', 'pipecat-livekit', 'qwen-omni-realtime']),
    );
    expect(catalog.llm.find((provider) => provider.id === 'openai')?.defaultModel).toBe('gpt-realtime-2');
    expect(catalog.stt.find((provider) => provider.id === 'openai')?.defaultModel).toBe('gpt-realtime-whisper');
  });

  it('returns stable defaults for a new agent model config', () => {
    expect(getVoiceProviderDefaults()).toMatchObject({
      llmProvider: 'gemini-live',
      sttProvider: 'deepgram',
      ttsProvider: 'google-chirp',
      realtimeProvider: 'gemini-live',
    });
  });

  it('masks provider credentials without leaking short keys', () => {
    expect(maskCredentialValue('sk-1234567890')).toBe('sk-1********890');
    expect(maskCredentialValue('abc')).toBe('***');
    expect(maskCredentialValue('')).toBe('');
  });
});
