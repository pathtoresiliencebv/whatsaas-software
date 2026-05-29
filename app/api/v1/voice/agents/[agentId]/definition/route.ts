import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import {
  getVoiceAgentDefinition,
  listVoiceAgentDefinitions,
  publishVoiceAgentDefinition,
  saveVoiceAgentDefinition,
} from '@/lib/voice/service';
import { jsonError } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ agentId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const { agentId } = await params;
  const numericAgentId = Number(agentId);
  try {
    const [definition, definitions] = await Promise.all([
      getVoiceAgentDefinition(team.id, numericAgentId),
      listVoiceAgentDefinitions(team.id, numericAgentId),
    ]);
    return NextResponse.json({ definition, definitions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const { agentId } = await params;
  const body = await request.json().catch(() => ({}));
  const workflowJson = body.workflowJson || body.workflow || body.definition;
  if (!workflowJson) {
    return NextResponse.json({ error: 'workflowJson is required' }, { status: 400 });
  }

  try {
    const result = await saveVoiceAgentDefinition({
      teamId: team.id,
      agentId: Number(agentId),
      workflowJson,
      variables: body.variables,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const { agentId } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const result = await publishVoiceAgentDefinition({
      teamId: team.id,
      agentId: Number(agentId),
      definitionId: body.definitionId ? Number(body.definitionId) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
