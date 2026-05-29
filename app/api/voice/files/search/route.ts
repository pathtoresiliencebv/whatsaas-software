import { NextResponse } from 'next/server';
import { searchVoiceKnowledge } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await requireVoicePermission('aiAgent');
  if (auth.error) return auth.error;
  try {
    const body = await readJson(request);
    const query = String(body.query || '').trim();
    if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 });
    const results = await searchVoiceKnowledge({
      teamId: auth.context.teamId,
      query,
      limit: Number(body.limit || 6),
    });
    return NextResponse.json({ results });
  } catch (error) {
    return jsonError(error);
  }
}
