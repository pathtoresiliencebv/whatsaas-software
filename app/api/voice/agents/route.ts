import { NextResponse } from 'next/server';
import { requireVoicePermission, jsonError, readJson } from '@/lib/voice/api';
import { createVoiceAgent, listVoiceSection, setDefaultWhatsappVoiceAgent, updateVoiceAgent } from '@/lib/voice/service';

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
      metadata: body.metadata,
      workflowJson: body.workflowJson || body.metadata?.workflowDefinition,
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
    const body = await readJson<{
      agentId?: number;
      isDefaultForWhatsapp?: boolean;
      name?: string;
      description?: string | null;
      systemPrompt?: string | null;
      firstMessage?: string | null;
      defaultLanguage?: string;
      channelMode?: string;
      status?: string;
      isActive?: boolean;
      metadata?: Record<string, any>;
    }>(request);

    if (!body.agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    if (body.isDefaultForWhatsapp === true) {
      await setDefaultWhatsappVoiceAgent(auth.context.teamId, body.agentId);
      return NextResponse.json({ success: true });
    }

    const agent = await updateVoiceAgent({
      teamId: auth.context.teamId,
      agentId: body.agentId,
      name: body.name,
      description: body.description,
      systemPrompt: body.systemPrompt,
      firstMessage: body.firstMessage,
      defaultLanguage: body.defaultLanguage,
      channelMode: body.channelMode,
      status: body.status,
      isActive: body.isActive,
      metadata: body.metadata,
    });

    return NextResponse.json({ agent });
  } catch (error) {
    return jsonError(error);
  }
}
