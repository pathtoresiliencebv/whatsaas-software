import { NextResponse } from 'next/server';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';
import { createVoiceSectionRecord, getVoiceCatalog } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    return NextResponse.json(await getVoiceCatalog());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;

  try {
    const body = await readJson(request);
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const recording = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'recordings', {
      recordingId: body.voiceId || `voice_${Date.now()}`,
      name: body.name,
      storageUrl: body.storageUrl || null,
      mimeType: body.mimeType || 'audio/wav',
      durationSeconds: body.durationSeconds || null,
      metadata: {
        provider: body.provider || 'chatterbox',
        type: 'voice_asset',
        cloneStatus: body.cloneStatus || 'pending',
        referenceFileName: body.referenceFileName || null,
      },
      transcript: body.transcript || null,
      isActive: true,
    });

    return NextResponse.json({ voice: recording }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
