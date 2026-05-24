import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { endVoiceRun } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ runId: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;

  try {
    const { runId } = await params;
    const body = await readJson(request);
    const run = await endVoiceRun({
      teamId: auth.context.teamId,
      runId: Number(runId),
      status: body.status || 'completed',
      usage: body.usage || {},
      error: body.error || null,
    });

    return NextResponse.json({ run });
  } catch (error) {
    return jsonError(error);
  }
}
