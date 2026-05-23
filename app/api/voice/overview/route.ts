import { NextResponse } from 'next/server';
import { requireVoicePermission, jsonError } from '@/lib/voice/api';
import { getVoiceOverview } from '@/lib/voice/service';
import { getCreditsBalance } from '@/lib/plugins/voice-call/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('voiceCalls');
  if (auth.error) return auth.error;

  try {
    const [overview, credits] = await Promise.all([
      getVoiceOverview(auth.context.teamId),
      getCreditsBalance(auth.context.teamId),
    ]);
    return NextResponse.json({ ...overview, credits });
  } catch (error) {
    return jsonError(error);
  }
}
