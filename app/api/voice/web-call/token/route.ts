import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { createVoiceWebCallSession } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;

  try {
    const body = await readJson(request);
    if (!body.agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const session = await createVoiceWebCallSession({
      teamId: auth.context.teamId,
      userId: auth.context.userId,
      agentId: Number(body.agentId),
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
