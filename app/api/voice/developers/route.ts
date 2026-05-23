import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { apiKeys } from '@/lib/db/schema';
import { jsonError, requireVoicePermission } from '@/lib/voice/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireVoicePermission('settings');
  if (auth.error) return auth.error;
  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.teamId, auth.context.teamId))
      .orderBy(desc(apiKeys.createdAt));

    return NextResponse.json({
      apiKeys: keys,
      endpoints: [
        '/api/voice/runs',
        '/api/voice/campaigns',
        '/api/voice/agents',
      ],
    });
  } catch (error) {
    return jsonError(error);
  }
}
