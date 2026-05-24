import { describe, expect, it } from 'vitest';
import {
  buildRuntimeSession,
  reduceRuntimeEvent,
  summarizeRunUsage,
  type RuntimeRunState,
  type VoiceRuntimeEvent,
} from '@/lib/voice/runtime';

describe('voice runtime helpers', () => {
  it('builds a deterministic LiveKit/Pipecat session descriptor', () => {
    const session = buildRuntimeSession({
      teamId: 3,
      agentId: 9,
      runId: 12,
      channel: 'browser',
    });

    expect(session.roomName).toBe('kyrn-voice-team-3-agent-9-run-12');
    expect(session.transport).toBe('livekit');
    expect(session.pipeline).toEqual(['stt', 'workflow', 'llm', 'tools', 'tts']);
  });

  it('reduces transcript and usage events into run state', () => {
    const events: VoiceRuntimeEvent[] = [
      { type: 'transcript.user', text: 'Hello', at: '2026-05-24T10:00:00.000Z' },
      { type: 'transcript.agent', text: 'How can I help?', at: '2026-05-24T10:00:01.000Z' },
      { type: 'usage', usage: { durationSeconds: 61, llmTokens: 120, ttsCharacters: 55 } },
    ];
    const state = events.reduce<RuntimeRunState>(reduceRuntimeEvent, { messages: [], transcript: '', usage: {} });

    expect(state.messages).toHaveLength(2);
    expect(state.transcript).toContain('User: Hello');
    expect(state.usage).toMatchObject({ durationSeconds: 61, llmTokens: 120, ttsCharacters: 55 });
  });

  it('summarizes multimodal usage into voice credits', () => {
    expect(
      summarizeRunUsage({
        durationSeconds: 62,
        llmTokens: 2400,
        ttsCharacters: 800,
        telephonySeconds: 62,
      }),
    ).toMatchObject({
      durationCredits: 2,
      totalCredits: 5,
    });
  });
});
