import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { getVoiceRuntimeWorkerConfig } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const runtimeSecret = process.env.VOICE_RUNTIME_SECRET;
    const providedSecret = request.headers.get('x-voice-runtime-secret') || body.runtimeSecret;
    const hasWorkerAuth = Boolean(runtimeSecret && providedSecret && providedSecret === runtimeSecret);

    if (!hasWorkerAuth) {
      const auth = await requireVoicePermission('voiceCalls');
      if (auth.error) return auth.error;
      body.teamId = auth.context.teamId;
    }

    if (!body.teamId || !body.runId) {
      return NextResponse.json({ error: 'teamId and runId are required' }, { status: 400 });
    }

    const config = await getVoiceRuntimeWorkerConfig({
      teamId: Number(body.teamId),
      runId: Number(body.runId),
    });

    return NextResponse.json({ config });
  } catch (error) {
    return jsonError(error);
  }
}
