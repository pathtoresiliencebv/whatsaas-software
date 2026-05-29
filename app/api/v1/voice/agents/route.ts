import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { createVoiceAgent, listVoiceSection } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const agents = await listVoiceSection(team.id, 'agents');
  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const agent = await createVoiceAgent({
    teamId: team.id,
    userId: null,
    name: body.name,
    description: body.description,
    systemPrompt: body.systemPrompt,
    channelMode: body.channelMode,
    isDefaultForWhatsapp: body.isDefaultForWhatsapp === true,
    metadata: body.metadata,
    workflowJson: body.workflowJson,
  });

  return NextResponse.json({ agent }, { status: 201 });
}
