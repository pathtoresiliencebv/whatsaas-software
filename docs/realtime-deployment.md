# Realtime voice deployment

Deploy realtime voice as two services:

- The existing Next.js app on Vercel or the normal WhatSaaS host.
- `realtime-worker/` as a long-running container with WebSocket support.

## Production path

Use LiveKit Cloud for browser calls and SIP-routed phone calls. Keep Twilio Media Streams as fallback only.

1. Create a LiveKit Cloud project.
2. Set these env vars on the Next.js app:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `PIPECAT_AGENT_NAME=kyrn-pipecat`
   - `VOICE_RUNTIME_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `BASE_URL`
   - `PIPECAT_WEBSOCKET_BASE_URL=https://voice.yourdomain.com`
3. Deploy `realtime-worker/` to a host that supports persistent WebSockets.
4. Set the same runtime secret and provider keys on the worker.
5. In Twilio, point the voice webhook to:
   - `https://app.yourdomain.com/api/webhook/twilio/voice`
6. For direct Media Streams fallback, Twilio will connect to:
   - `wss://voice.yourdomain.com/api/voice/runtime/twilio-media`

## Container host example

```bash
docker compose -f docker-compose.prod.yml --profile realtime up -d realtime-worker
```

## Smoke test

After creating a test voice run, set:

```bash
VOICE_API_BASE_URL=https://app.yourdomain.com
VOICE_RUNTIME_SECRET=...
SMOKE_TEAM_ID=...
SMOKE_RUN_ID=...
pnpm realtime:smoke
```

The smoke test checks that the worker can fetch runtime config and post runtime events.
