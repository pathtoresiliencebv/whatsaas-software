import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { voiceCampaignLeads } from '@/lib/db/schema';
import { enqueueVoiceCampaignLeads } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const auth = await requireVoicePermission('campaigns');
  if (auth.error) return auth.error;
  try {
    const { campaignId } = await params;
    const leads = await db.query.voiceCampaignLeads.findMany({
      where: and(eq(voiceCampaignLeads.teamId, auth.context.teamId), eq(voiceCampaignLeads.campaignId, Number(campaignId))),
      orderBy: [desc(voiceCampaignLeads.createdAt)],
      limit: 200,
    });
    return NextResponse.json({ leads });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const auth = await requireVoicePermission('campaigns');
  if (auth.error) return auth.error;
  try {
    const { campaignId } = await params;
    const body = await readJson(request);
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length) return NextResponse.json({ error: 'rows are required' }, { status: 400 });
    const result = await enqueueVoiceCampaignLeads({
      teamId: auth.context.teamId,
      campaignId: Number(campaignId),
      rows,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
