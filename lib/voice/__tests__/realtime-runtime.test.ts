import { describe, expect, it } from 'vitest';
import {
  buildLiveKitAgentMetadata,
  buildLiveKitSipTwiML,
  buildPipecatWorkerConfig,
  buildTwilioMediaStreamTwiML,
  getRealtimeRuntimeConfig,
  normalizeWebsocketBaseUrl,
} from '@/lib/voice/realtime-runtime';
import { buildRuntimeSession } from '@/lib/voice/runtime';

describe('realtime voice runtime', () => {
  const session = buildRuntimeSession({
    teamId: 7,
    agentId: 11,
    runId: 19,
    channel: 'browser',
  });

  it('builds Pipecat worker metadata for a LiveKit-dispatched agent', () => {
    const metadata = buildLiveKitAgentMetadata({
      session,
      agentName: 'kyrn-pipecat',
      callbackBaseUrl: 'https://app.example.com',
      workflow: { nodes: [{ id: 'start' }], edges: [] },
      variables: { contactName: 'Sam' },
    });

    expect(JSON.parse(metadata)).toMatchObject({
      runtime: 'pipecat-livekit',
      transport: 'livekit',
      agentName: 'kyrn-pipecat',
      teamId: 7,
      agentId: 11,
      runId: 19,
      roomName: 'kyrn-voice-team-7-agent-11-run-19',
      callbackUrl: 'https://app.example.com/api/voice/runtime/events',
      workflow: { nodes: [{ id: 'start' }], edges: [] },
      variables: { contactName: 'Sam' },
    });
  });

  it('builds a Pipecat worker config with provider defaults and callbacks', () => {
    const config = buildPipecatWorkerConfig({
      session,
      livekitUrl: 'wss://livekit.example.com',
      callbackBaseUrl: 'https://app.example.com/',
      runtimeSecret: 'secret-123',
    });

    expect(config).toMatchObject({
      runtime: 'pipecat-livekit',
      livekit: {
        url: 'wss://livekit.example.com',
        roomName: session.roomName,
      },
      callbacks: {
        eventsUrl: 'https://app.example.com/api/voice/runtime/events',
        runtimeSecret: 'secret-123',
      },
      audio: {
        inputSampleRate: 16000,
        outputSampleRate: 24000,
      },
    });
  });

  it('normalizes websocket callback bases for Twilio Media Streams', () => {
    expect(normalizeWebsocketBaseUrl('https://app.example.com')).toBe('wss://app.example.com');
    expect(normalizeWebsocketBaseUrl('http://localhost:3000/')).toBe('ws://localhost:3000');
    expect(normalizeWebsocketBaseUrl('wss://voice.example.com')).toBe('wss://voice.example.com');
  });

  it('builds Twilio Media Streams TwiML with run context parameters', () => {
    const twiml = buildTwilioMediaStreamTwiML({
      websocketBaseUrl: 'https://app.example.com',
      session,
      callSid: 'CA123',
      from: '+155501',
      to: '+155502',
    });

    expect(twiml).toContain('<Connect>');
    expect(twiml).toContain('<Stream url="wss://app.example.com/api/voice/runtime/twilio-media">');
    expect(twiml).toContain('<Parameter name="runId" value="19" />');
    expect(twiml).toContain('<Parameter name="callSid" value="CA123" />');
  });

  it('builds LiveKit SIP TwiML using configured trunk credentials', () => {
    const twiml = buildLiveKitSipTwiML({
      sipHost: 'sip.livekit.cloud',
      sipUsername: 'user',
      sipPassword: 'pass',
      phoneNumber: '+15551234567',
    });

    expect(twiml).toContain('<Dial>');
    expect(twiml).toContain('<Sip username="user" password="pass">');
    expect(twiml).toContain('sip:+15551234567@sip.livekit.cloud;transport=tcp');
  });

  it('reports runtime readiness from environment values', () => {
    const config = getRealtimeRuntimeConfig({
      LIVEKIT_URL: 'wss://livekit.example.com',
      LIVEKIT_API_KEY: 'key',
      LIVEKIT_API_SECRET: 'secret',
      PIPECAT_AGENT_NAME: 'kyrn-pipecat',
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
    });

    expect(config).toMatchObject({
      livekitConfigured: true,
      callbacksConfigured: true,
      agentName: 'kyrn-pipecat',
      publicBaseUrl: 'https://app.example.com',
    });
  });
});
