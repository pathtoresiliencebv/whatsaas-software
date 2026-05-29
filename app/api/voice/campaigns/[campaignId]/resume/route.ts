import { NextResponse } from 'next/server';
import { jsonError, requireVoicePermission } from '@/lib/voice/api';
import { updateVoiceCampaignStatus } from '@/lib/voice/service';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ campaignId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireVoicePermission('campaigns');
  if (auth.error) return auth.error;

  try {
    const { campaignId } = await params;
    const campaign = await updateVoiceCampaignStatus({
      teamId: auth.context.teamId,
      campaignId: Number(campaignId),
      action: 'resume',
    });
    return NextResponse.json({ campaign });
  } catch (error) {
    return jsonError(error);
  }
}
