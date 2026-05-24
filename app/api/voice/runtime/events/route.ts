import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { ingestVoiceRuntimeEvent } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const runtimeSecret = process.env.VOICE_RUNTIME_SECRET;
    const providedSecret = request.headers.get('x-voice-runtime-secret');
    const hasWorkerAuth = Boolean(runtimeSecret && providedSecret && providedSecret === runtimeSecret);

    if (!hasWorkerAuth) {
      const auth = await requireVoicePermission('voiceCalls');
      if (auth.error) return auth.error;
      body.teamId = auth.context.teamId;
    }

    if (!body.teamId || !body.runId || !body.event?.type) {
      return NextResponse.json({ error: 'teamId, runId and event.type are required' }, { status: 400 });
    }

    const run = await ingestVoiceRuntimeEvent({
      teamId: Number(body.teamId),
      runId: Number(body.runId),
      event: body.event,
    });

    return NextResponse.json({ run });
  } catch (error) {
    return jsonError(error);
  }
}
