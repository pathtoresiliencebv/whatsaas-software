import { NextResponse } from 'next/server';
import { createVoiceSectionRecord, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ tools: await listVoiceSection(auth.context.teamId, 'tools') });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    const body = await readJson(request);
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const tool = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'tools', {
      name: body.name,
      description: body.description || null,
      category: body.category || 'http_api',
      definition: body.definition || {},
      status: body.status || 'active',
    });
    return NextResponse.json({ tool }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
