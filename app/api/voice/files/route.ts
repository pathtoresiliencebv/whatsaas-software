import { NextResponse } from 'next/server';
import { createVoiceFileWithChunks, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ files: await listVoiceSection(auth.context.teamId, 'files') });
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
    const file = await createVoiceFileWithChunks({
      teamId: auth.context.teamId,
      userId: auth.context.userId,
      name: body.name,
      mimeType: body.mimeType || 'text/plain',
      sizeBytes: body.sizeBytes || null,
      storageUrl: body.storageUrl || null,
      contentText: body.contentText || '',
      metadata: body.metadata || {},
    });
    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
