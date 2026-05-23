import { NextResponse } from 'next/server';
import { createVoiceSectionRecord, listVoiceSection } from '@/lib/voice/service';
import { jsonError, readJson, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('campaigns');
  if (auth.error) return auth.error;
  try {
    return NextResponse.json({ campaigns: await listVoiceSection(auth.context.teamId, 'campaigns') });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireVoicePermission('campaigns');
  if (auth.error) return auth.error;
  try {
    const body = await readJson(request);
    if (!body.name || !body.agentId) {
      return NextResponse.json({ error: 'name and agentId are required' }, { status: 400 });
    }
    const campaign = await createVoiceSectionRecord(auth.context.teamId, auth.context.userId, 'campaigns', {
      name: body.name,
      agentId: Number(body.agentId),
      telephonyConfigId: body.telephonyConfigId ? Number(body.telephonyConfigId) : null,
      status: body.status || 'draft',
      sourceType: body.sourceType || 'manual',
      totalLeads: body.totalLeads || 0,
      maxConcurrency: body.maxConcurrency || 1,
      retryConfig: body.retryConfig || {},
      scheduleConfig: body.scheduleConfig || {},
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
