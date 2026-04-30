import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser } from '@/lib/db/queries';
import { evolutionInstances, contacts, automations } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [instanceCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(evolutionInstances)
      .where(eq(evolutionInstances.teamId, team.id));

    const [contactCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contacts)
      .where(eq(contacts.teamId, team.id));

    const [automationCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(automations)
      .where(eq(automations.teamId, team.id));

    return NextResponse.json({
      hasInstance: (instanceCount?.count ?? 0) > 0,
      hasContacts: (contactCount?.count ?? 0) > 0,
      hasAutomations: (automationCount?.count ?? 0) > 0,
    });
  } catch (error: any) {
    console.error('[Onboarding Status]', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
