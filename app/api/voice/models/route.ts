import { NextResponse } from 'next/server';
import { createVoiceSectionRecord, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ models: await listVoiceSection(auth.context.teamId, 'models') });
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
    const model = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'models', body);
    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
