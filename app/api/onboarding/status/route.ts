import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser } from '@/lib/db/queries';
import {
  automations,
  contacts,
  evolutionInstances,
  teamMembers,
  voiceAgents,
  voiceModelConfigs,
  voicePhoneNumbers,
  voiceTelephonyConfigs,
} from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      [instanceCount],
      [contactCount],
      [automationCount],
      [voiceAgentCount],
      [voiceModelCount],
      [voiceTelephonyCount],
      [voicePhoneNumberCount],
      [memberCount],
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(evolutionInstances)
        .where(eq(evolutionInstances.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
        .where(eq(contacts.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(automations)
        .where(eq(automations.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(voiceAgents)
        .where(eq(voiceAgents.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(voiceModelConfigs)
        .where(eq(voiceModelConfigs.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(voiceTelephonyConfigs)
        .where(eq(voiceTelephonyConfigs.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(voicePhoneNumbers)
        .where(eq(voicePhoneNumbers.teamId, team.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id)),
    ]);

    return NextResponse.json({
      teamName: team.name,
      createdAt: team.createdAt,
      hasInstance: (instanceCount?.count ?? 0) > 0,
      hasContacts: (contactCount?.count ?? 0) > 0,
      hasAutomations: (automationCount?.count ?? 0) > 0,
      hasVoiceAgent: (voiceAgentCount?.count ?? 0) > 0,
      hasVoiceModel: (voiceModelCount?.count ?? 0) > 0,
      hasVoiceTelephony: (voiceTelephonyCount?.count ?? 0) > 0,
      hasVoicePhoneNumber: (voicePhoneNumberCount?.count ?? 0) > 0,
      hasTeamMembers: (memberCount?.count ?? 0) > 1,
      counts: {
        instances: instanceCount?.count ?? 0,
        contacts: contactCount?.count ?? 0,
        automations: automationCount?.count ?? 0,
        voiceAgents: voiceAgentCount?.count ?? 0,
        voiceModels: voiceModelCount?.count ?? 0,
        voiceTelephony: voiceTelephonyCount?.count ?? 0,
        voicePhoneNumbers: voicePhoneNumberCount?.count ?? 0,
        members: memberCount?.count ?? 0,
      },
    });
  } catch (error: any) {
    console.error('[Onboarding Status]', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
