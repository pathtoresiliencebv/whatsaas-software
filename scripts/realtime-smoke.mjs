#!/usr/bin/env node

const baseUrl = process.env.VOICE_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL;
const runtimeSecret = process.env.VOICE_RUNTIME_SECRET;
const teamId = process.env.SMOKE_TEAM_ID;
const runId = process.env.SMOKE_RUN_ID;

if (!baseUrl || !runtimeSecret || !teamId || !runId) {
  console.error('Required env: VOICE_API_BASE_URL, VOICE_RUNTIME_SECRET, SMOKE_TEAM_ID, SMOKE_RUN_ID');
  process.exit(2);
}

const headers = {
  'content-type': 'application/json',
  'x-voice-runtime-secret': runtimeSecret,
};

const configResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/api/voice/runtime/config`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ teamId: Number(teamId), runId: Number(runId) }),
});

if (!configResponse.ok) {
  console.error(`Config check failed: ${configResponse.status} ${await configResponse.text()}`);
  process.exit(1);
}

const eventResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/api/voice/runtime/events`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    teamId: Number(teamId),
    runId: Number(runId),
    event: { type: 'runtime.smoke', message: 'Realtime worker callback smoke test' },
  }),
});

if (!eventResponse.ok) {
  console.error(`Event check failed: ${eventResponse.status} ${await eventResponse.text()}`);
  process.exit(1);
}

console.log('Realtime runtime config/events smoke check passed.');
