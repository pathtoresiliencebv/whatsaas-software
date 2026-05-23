import { NextResponse } from 'next/server';
import { createVoiceSectionRecord, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ telephony: await listVoiceSection(auth.context.teamId, 'telephony') });
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
    const telephony = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'telephony', {
      name: body.name,
      provider: body.provider || 'twilio',
      credentials: body.credentials || {},
      isDefaultOutbound: body.isDefaultOutbound === true,
      isActive: body.isActive !== false,
    });
    return NextResponse.json({ telephony }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
