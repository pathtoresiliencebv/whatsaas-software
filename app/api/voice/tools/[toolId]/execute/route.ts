import { NextResponse } from 'next/server';
import { executeTeamVoiceTool } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ toolId: string }> }) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    const { toolId } = await params;
    const body = await readJson(request);
    const result = await executeTeamVoiceTool({
      teamId: auth.context.teamId,
      toolId: Number(toolId),
      input: body.input || {},
      variables: body.variables || {},
    });
    return NextResponse.json({ result });
  } catch (error) {
    return jsonError(error);
  }
}
