import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { InsufficientVoiceCreditsError } from '@/lib/voice/credits';
import { completeVoiceRun, createVoiceRun, generateVoiceAgentReply, listVoiceRuns } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');
  const runs = await listVoiceRuns(team.id, {
    agentId: agentId ? Number(agentId) : undefined,
    limit: Number(url.searchParams.get('limit') || 50),
  });
  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.agentId) return NextResponse.json({ error: 'agentId is required' }, { status: 400 });

  try {
    const { run, agent } = await createVoiceRun({
      teamId: team.id,
      userId: null,
      agentId: Number(body.agentId),
      channel: body.channel || 'api',
      direction: body.direction || 'outbound',
      input: body.input || '',
      fromNumber: body.fromNumber || null,
      toNumber: body.toNumber || null,
      reserveCredits: body.reserveCredits === undefined ? 1 : Number(body.reserveCredits),
    });

    const output = await generateVoiceAgentReply({
      teamId: team.id,
      agentId: agent.id,
      input: body.input || 'Start an API voice run.',
    });

    const completed = await completeVoiceRun({
      teamId: team.id,
      runId: run.id,
      output,
      durationSeconds: 1,
      status: 'completed',
    });

    return NextResponse.json({ run: completed, output }, { status: 201 });
  } catch (error) {
    if (error instanceof InsufficientVoiceCreditsError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error('[v1 voice runs] create failed', error);
    return NextResponse.json(
      { error: 'Failed to create voice run' },
      { status: 500 },
    );
  }
}
