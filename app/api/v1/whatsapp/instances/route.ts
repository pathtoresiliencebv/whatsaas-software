import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { db } from '@/lib/db/drizzle';
import { evolutionInstances } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const instances = await db
    .select({
      id: evolutionInstances.id,
      instanceName: evolutionInstances.instanceName,
      displayName: evolutionInstances.displayName,
      instanceNumber: evolutionInstances.instanceNumber,
      integration: evolutionInstances.integration,
      createdAt: evolutionInstances.createdAt,
      updatedAt: evolutionInstances.updatedAt,
    })
    .from(evolutionInstances)
    .where(eq(evolutionInstances.teamId, team.id));

  return NextResponse.json({ instances });
}
