import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import {
  getVoiceAgentDefinition,
  listVoiceAgentDefinitions,
  saveVoiceAgentDefinition,
} from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ agentId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const { agentId } = await params;
    const numericAgentId = Number(agentId);
    const [definition, definitions] = await Promise.all([
      getVoiceAgentDefinition(auth.context.teamId, numericAgentId),
      listVoiceAgentDefinitions(auth.context.teamId, numericAgentId),
    ]);
    return NextResponse.json({ definition, definitions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const { agentId } = await params;
    const body = await readJson(request);
    const workflowJson = body.workflowJson || body.workflow || body.definition;
    if (!workflowJson) {
      return NextResponse.json({ error: 'workflowJson is required' }, { status: 400 });
    }

    const result = await saveVoiceAgentDefinition({
      teamId: auth.context.teamId,
      agentId: Number(agentId),
      workflowJson,
      variables: body.variables,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
