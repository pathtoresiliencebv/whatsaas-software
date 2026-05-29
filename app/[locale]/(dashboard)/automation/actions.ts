'use server';

import { db } from '@/lib/db/drizzle';
import { automations } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTeamForUser } from '@/lib/db/queries';

export async function getAutomations() {
  const team = await getTeamForUser();
  if (!team) return [];

  return await db.query.automations.findMany({
    where: eq(automations.teamId, team.id),
    orderBy: [desc(automations.updatedAt)],
    with: {
        instance: true 
    }
  });
}

export async function getAutomation(id: number) {
  const team = await getTeamForUser();
  if (!team) return null;

  const automation = await db.query.automations.findFirst({
    where: eq(automations.id, id),
    with: { instance: { columns: { integration: true } } },
  });

  if (!automation || automation.teamId !== team.id) return null;
  return automation;
}

export async function createAutomation(
  name: string,
  instanceId?: number | null,
  triggerKeyword?: string | null,
  workflow?: { useCase?: string; activityDescription?: string }
) {
  const team = await getTeamForUser();
  if (!team) throw new Error('Unauthorized');

  const useCase = workflow?.useCase?.trim() || 'WhatsApp conversations';
  const activityDescription = workflow?.activityDescription?.trim()
    || 'Answer inbound WhatsApp conversations clearly, collect the important details, and hand off when a teammate is needed.';

  const [newBot] = await db.insert(automations).values({
    teamId: team.id,
    instanceId: instanceId || null,
    name: name,
    triggerKeyword: triggerKeyword || null,
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 120, y: 120 },
        data: {
          label: 'Incoming WhatsApp',
          title: 'Incoming WhatsApp',
          kind: 'start',
          badge: 'Start Node',
          prompt: `# Use case\n${useCase}\n\n# Entry\nA new WhatsApp message enters this automation. Read the conversation context and decide the next best step.`,
          message: 'Incoming WhatsApp message starts this automation.',
        },
      },
      {
        id: 'qualify',
        type: 'message',
        position: { x: 740, y: 360 },
        data: {
          label: 'Qualify and Reply',
          title: 'Qualify and Reply',
          kind: 'message',
          badge: 'Agent Node',
          prompt: `# Main task\n${activityDescription}\n\nWrite warm, concise WhatsApp replies. Ask one focused question at a time and use available contact details when relevant.`,
          message: 'Hi! Thanks for your message. How can we help you?',
        },
      },
      {
        id: 'global',
        type: 'condition',
        position: { x: 110, y: 360 },
        data: {
          label: 'Global Rules',
          title: 'Global Rules',
          kind: 'condition',
          badge: 'Global Node',
          prompt: 'Stay on brand, keep replies short, never invent missing details, and escalate sensitive requests to a human teammate.',
          message: 'Global WhatsApp agent rules.',
        },
      },
      {
        id: 'handoff',
        type: 'handoff',
        position: { x: 430, y: 650 },
        data: {
          label: 'Human Handoff',
          title: 'Human Handoff',
          kind: 'handoff',
          badge: 'Action Node',
          prompt: 'When the conversation needs a human, summarize the customer need, tag the chat, and pause automation.',
          message: 'Escalate to a teammate.',
        },
      },
    ],
    edges: [
      {
        id: 'start-qualify',
        source: 'start',
        target: 'qualify',
        data: { label: 'Reply' },
      },
      {
        id: 'start-handoff',
        source: 'start',
        target: 'handoff',
        data: { label: 'Escalate' },
      },
      {
        id: 'qualify-handoff',
        source: 'qualify',
        target: 'handoff',
        data: { label: 'Needs human' },
      },
    ],
    isActive: false, 
  }).returning();

  revalidatePath('/automation');
  return { success: true, id: newBot.id };
}

export async function saveAutomation(id: number, nodes: any[], edges: any[]) {
  const team = await getTeamForUser();
  if (!team) throw new Error('Unauthorized');

  await db.update(automations)
    .set({ nodes, edges, updatedAt: new Date() })
    .where(and(eq(automations.id, id), eq(automations.teamId, team.id)));

  revalidatePath(`/automation/${id}`);
  return { success: true };
}

export async function toggleAutomationStatus(id: number, isActive: boolean) {
    const team = await getTeamForUser();
    if (!team) throw new Error('Unauthorized');

    await db.update(automations)
        .set({ isActive, updatedAt: new Date() })
        .where(and(eq(automations.id, id), eq(automations.teamId, team.id)));
    
    revalidatePath(`/automation/${id}`);
    revalidatePath('/automation');
    return { success: true };
}

export async function deleteAutomation(id: number) {
  const team = await getTeamForUser();
  if (!team) throw new Error('Unauthorized');

  await db.delete(automations).where(and(eq(automations.id, id), eq(automations.teamId, team.id)));
  revalidatePath('/automation');
}
