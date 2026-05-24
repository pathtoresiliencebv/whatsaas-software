import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { publishVoiceAgentDefinition } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ agentId: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const { agentId } = await params;
    const body = await readJson(request);
    const result = await publishVoiceAgentDefinition({
      teamId: auth.context.teamId,
      agentId: Number(agentId),
      definitionId: body.definitionId ? Number(body.definitionId) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
