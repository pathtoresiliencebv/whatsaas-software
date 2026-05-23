import { NextResponse } from 'next/server';
import { requireVoicePermission, jsonError, readJson } from '@/lib/voice/api';
import { createVoiceAgent, listVoiceSection, setDefaultWhatsappVoiceAgent } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const agents = await listVoiceSection(auth.context.teamId, 'agents');
    return NextResponse.json({ agents });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const body = await readJson(request);
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const agent = await createVoiceAgent({
      teamId: auth.context.teamId,
      userId: auth.context.userId,
      name: body.name,
      description: body.description,
      systemPrompt: body.systemPrompt,
      channelMode: body.channelMode,
      isDefaultForWhatsapp: body.isDefaultForWhatsapp === true,
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const body = await readJson<{ agentId?: number; isDefaultForWhatsapp?: boolean }>(request);
    if (!body.agentId || body.isDefaultForWhatsapp !== true) {
      return NextResponse.json({ error: 'agentId and isDefaultForWhatsapp are required' }, { status: 400 });
    }
    await setDefaultWhatsappVoiceAgent(auth.context.teamId, body.agentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
