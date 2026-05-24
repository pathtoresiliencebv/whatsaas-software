import { NextResponse } from 'next/server';
import { requireVoicePermission, jsonError, readJson } from '@/lib/voice/api';
import { completeVoiceRun, createVoiceRun, generateVoiceAgentReply, listVoiceRuns } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;

  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const runs = await listVoiceRuns(auth.context.teamId, {
      agentId: agentId ? Number(agentId) : undefined,
      limit: Number(url.searchParams.get('limit') || 50),
    });
    return NextResponse.json({ runs });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;

  try {
    const body = await readJson(request);
    if (!body.agentId) return NextResponse.json({ error: 'agentId is required' }, { status: 400 });

    const { run, agent } = await createVoiceRun({
      teamId: auth.context.teamId,
      userId: auth.context.userId,
      agentId: Number(body.agentId),
      channel: body.channel || 'api',
      direction: body.direction || 'outbound',
      input: body.input || '',
      fromNumber: body.fromNumber || null,
      toNumber: body.toNumber || null,
      reserveCredits: body.reserveCredits ? Number(body.reserveCredits) : 1,
    });

    const output = await generateVoiceAgentReply({
      teamId: auth.context.teamId,
      agentId: agent.id,
      input: body.input || 'Start a test voice run.',
    });

    const completed = await completeVoiceRun({
      teamId: auth.context.teamId,
      runId: run.id,
      output,
      durationSeconds: 1,
      status: 'completed',
    });

    return NextResponse.json({ run: completed, output }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
