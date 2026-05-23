import { NextResponse } from 'next/server';
import { createVoiceSectionRecord, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ recordings: await listVoiceSection(auth.context.teamId, 'recordings') });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;
  try {
    const body = await readJson(request);
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const recording = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'recordings', {
      recordingId: body.recordingId || crypto.randomUUID(),
      name: body.name,
      transcript: body.transcript || null,
      storageUrl: body.storageUrl || null,
      mimeType: body.mimeType || 'audio/mpeg',
      durationSeconds: body.durationSeconds || null,
      metadata: body.metadata || {},
      isActive: body.isActive !== false,
    });
    return NextResponse.json({ recording }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
