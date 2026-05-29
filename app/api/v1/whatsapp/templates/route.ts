import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { db } from '@/lib/db/drizzle';
import { evolutionInstances, wabaTemplates } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const url = new URL(request.url);
  const instanceName = url.searchParams.get('instanceName');

  const templates = await db
    .select({
      id: wabaTemplates.id,
      instanceName: evolutionInstances.instanceName,
      metaId: wabaTemplates.metaId,
      name: wabaTemplates.name,
      language: wabaTemplates.language,
      category: wabaTemplates.category,
      status: wabaTemplates.status,
      components: wabaTemplates.components,
      updatedAt: wabaTemplates.updatedAt,
      createdAt: wabaTemplates.createdAt,
    })
    .from(wabaTemplates)
    .innerJoin(evolutionInstances, eq(wabaTemplates.instanceId, evolutionInstances.id))
    .where(and(
      eq(wabaTemplates.teamId, team.id),
      ...(instanceName ? [eq(evolutionInstances.instanceName, instanceName)] : []),
    ))
    .orderBy(desc(wabaTemplates.updatedAt));

  return NextResponse.json({ templates });
}
