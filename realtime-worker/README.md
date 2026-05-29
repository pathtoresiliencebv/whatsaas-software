# Kyrn realtime worker

This service is the long-running runtime for realtime voice. Keep it separate from the Next.js/Vercel app.

## What runs where

- Next.js/Vercel: dashboard, auth, billing, `/api/voice/runtime/config`, `/api/voice/runtime/events`, LiveKit client token creation.
- LiveKit Cloud: rooms, WebRTC media, SIP bridge.
- This worker: Pipecat runtime process plus direct Twilio Media Streams fallback at `/api/voice/runtime/twilio-media`.

## Required production env

Copy `.env.example` into your hosting provider and set:

- `VOICE_API_BASE_URL`
- `VOICE_RUNTIME_SECRET`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

Direct Twilio Media Streams fallback also needs:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

## Local run

```bash
cd realtime-worker
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn kyrn_worker.main:app --reload --port 8080
```

Healthcheck:

```bash
curl http://localhost:8080/health
```

## Deploy

Build the container from this folder and deploy it to a host that supports long-running HTTP/WebSocket services.

Examples:

```bash
docker build -t kyrn-realtime-worker .
docker run --env-file .env -p 8080:8080 kyrn-realtime-worker
```

Point `PIPECAT_WEBSOCKET_BASE_URL` in the Next.js app to the public worker URL, for example:

```text
PIPECAT_WEBSOCKET_BASE_URL=https://voice.example.com
```

Twilio Media Streams require `wss://`; the Next.js TwiML helper converts the HTTPS worker base URL to `wss://`.
