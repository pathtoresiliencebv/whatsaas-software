import { and, count, desc, eq, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { db } from '@/lib/db/drizzle';
import {
  contacts,
  evolutionInstances,
  voiceAgentDefinitions,
  voiceAgentRuns,
  voiceAgents,
  voiceCampaignLeads,
  voiceCampaigns,
  voiceFiles,
  voiceModelConfigs,
  voicePhoneNumbers,
  voiceRecordings,
  voiceTelephonyConfigs,
  voiceTools,
} from '@/lib/db/schema';
import { sendTextViaProvider } from '@/lib/whatsapp/send-helpers';
import { calculateVoiceCredits, finalizeVoiceRunCredits, reserveVoiceCredits } from './credits';

export type VoiceSection =
  | 'agents'
  | 'campaigns'
  | 'models'
  | 'telephony'
  | 'tools'
  | 'files'
  | 'recordings'
  | 'runs';

const TABLES = {
  agents: voiceAgents,
  campaigns: voiceCampaigns,
  models: voiceModelConfigs,
  telephony: voiceTelephonyConfigs,
  tools: voiceTools,
  files: voiceFiles,
  recordings: voiceRecordings,
  runs: voiceAgentRuns,
} as const;

export async function getVoiceOverview(teamId: number) {
  const [
    [agentCount],
    [runCount],
    [campaignCount],
    [recordingCount],
  ] = await Promise.all([
    db.select({ count: count() }).from(voiceAgents).where(eq(voiceAgents.teamId, teamId)),
    db.select({ count: count() }).from(voiceAgentRuns).where(eq(voiceAgentRuns.teamId, teamId)),
    db.select({ count: count() }).from(voiceCampaigns).where(eq(voiceCampaigns.teamId, teamId)),
    db.select({ count: count() }).from(voiceRecordings).where(eq(voiceRecordings.teamId, teamId)),
  ]);

  const recentRuns = await listVoiceRuns(teamId, { limit: 6 });

  return {
    metrics: {
      agents: agentCount.count,
      runs: runCount.count,
      campaigns: campaignCount.count,
      recordings: recordingCount.count,
    },
    recentRuns,
  };
}

export async function listVoiceSection(teamId: number, section: VoiceSection, limit = 100) {
  const table = TABLES[section];
  return db.select().from(table as any).where(eq((table as any).teamId, teamId)).orderBy(desc((table as any).createdAt)).limit(limit);
}

export async function createVoiceSectionRecord(
  teamId: number,
  userId: number,
  section: Exclude<VoiceSection, 'agents' | 'runs'>,
  values: Record<string, any>,
) {
  const table = TABLES[section];
  const createdBy = ['campaigns', 'tools', 'files', 'recordings'].includes(section)
    ? { createdBy: userId }
    : {};
  const timestamps = ['campaigns', 'models', 'telephony', 'tools', 'files'].includes(section)
    ? { createdAt: new Date(), updatedAt: new Date() }
    : { createdAt: new Date() };

  const [record] = await db
    .insert(table as any)
    .values({
      ...values,
      ...createdBy,
      teamId,
      ...timestamps,
    })
    .returning();

  return record;
}

export async function listVoiceRuns(teamId: number, opts: { limit?: number; agentId?: number } = {}) {
  const conditions = [eq(voiceAgentRuns.teamId, teamId)];
  if (opts.agentId) conditions.push(eq(voiceAgentRuns.agentId, opts.agentId));

  return db
    .select({
      id: voiceAgentRuns.id,
      teamId: voiceAgentRuns.teamId,
      agentId: voiceAgentRuns.agentId,
      agentName: voiceAgents.name,
      channel: voiceAgentRuns.channel,
      direction: voiceAgentRuns.direction,
      status: voiceAgentRuns.status,
      transcript: voiceAgentRuns.transcript,
      creditsUsed: voiceAgentRuns.creditsUsed,
      reservedCredits: voiceAgentRuns.reservedCredits,
      error: voiceAgentRuns.error,
      startedAt: voiceAgentRuns.startedAt,
      endedAt: voiceAgentRuns.endedAt,
      createdAt: voiceAgentRuns.createdAt,
    })
    .from(voiceAgentRuns)
    .leftJoin(voiceAgents, eq(voiceAgentRuns.agentId, voiceAgents.id))
    .where(and(...conditions))
    .orderBy(desc(voiceAgentRuns.createdAt))
    .limit(opts.limit ?? 50);
}

export async function createVoiceAgent(params: {
  teamId: number;
  userId: number;
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
  channelMode?: string;
  isDefaultForWhatsapp?: boolean;
}) {
  const [agent] = await db
    .insert(voiceAgents)
    .values({
      teamId: params.teamId,
      createdBy: params.userId,
      name: params.name,
      description: params.description,
      systemPrompt: params.systemPrompt,
      channelMode: params.channelMode ?? 'whatsapp_voice',
      isDefaultForWhatsapp: params.isDefaultForWhatsapp ?? false,
      isActive: true,
      status: 'active',
    })
    .returning();

  await db.insert(voiceAgentDefinitions).values({
    teamId: params.teamId,
    agentId: agent.id,
    version: 1,
    status: 'published',
    workflowJson: {
      nodes: [],
      edges: [],
      systemPrompt: params.systemPrompt ?? '',
    },
    publishedAt: new Date(),
  });

  if (params.isDefaultForWhatsapp) {
    await setDefaultWhatsappVoiceAgent(params.teamId, agent.id);
  }

  return agent;
}

export async function setDefaultWhatsappVoiceAgent(teamId: number, agentId: number) {
  await db.transaction(async (tx) => {
    await tx
      .update(voiceAgents)
      .set({ isDefaultForWhatsapp: false, updatedAt: new Date() })
      .where(eq(voiceAgents.teamId, teamId));

    await tx
      .update(voiceAgents)
      .set({ isDefaultForWhatsapp: true, isActive: true, status: 'active', updatedAt: new Date() })
      .where(and(eq(voiceAgents.teamId, teamId), eq(voiceAgents.id, agentId)));
  });
}

export async function createVoiceRun(params: {
  teamId: number;
  userId?: number | null;
  agentId: number;
  channel: 'whatsapp' | 'phone' | 'browser' | 'api';
  direction?: 'inbound' | 'outbound';
  input?: string;
  chatId?: number | null;
  contactId?: number | null;
  campaignId?: number | null;
  campaignLeadId?: number | null;
  fromNumber?: string | null;
  toNumber?: string | null;
  reserveCredits?: number;
}) {
  const agent = await db.query.voiceAgents.findFirst({
    where: and(eq(voiceAgents.teamId, params.teamId), eq(voiceAgents.id, params.agentId)),
  });

  if (!agent || !agent.isActive) {
    throw new Error('Voice agent not found or inactive');
  }

  const definition = await db.query.voiceAgentDefinitions.findFirst({
    where: and(eq(voiceAgentDefinitions.teamId, params.teamId), eq(voiceAgentDefinitions.agentId, agent.id)),
    orderBy: [desc(voiceAgentDefinitions.version)],
  });

  const credits = params.reserveCredits ?? 1;
  await reserveVoiceCredits({
    teamId: params.teamId,
    credits,
    description: `Voice agent run reservation: ${agent.name}`,
  });

  const [run] = await db
    .insert(voiceAgentRuns)
    .values({
      teamId: params.teamId,
      agentId: agent.id,
      definitionId: definition?.id,
      campaignId: params.campaignId ?? null,
      campaignLeadId: params.campaignLeadId ?? null,
      chatId: params.chatId ?? null,
      contactId: params.contactId ?? null,
      channel: params.channel,
      direction: params.direction ?? 'inbound',
      status: 'running',
      fromNumber: params.fromNumber ?? null,
      toNumber: params.toNumber ?? null,
      transcript: params.input ?? null,
      messages: params.input ? [{ role: 'user', content: params.input, at: new Date().toISOString() }] : [],
      reservedCredits: credits,
      startedAt: new Date(),
    })
    .returning();

  return { run, agent, definition };
}

export async function completeVoiceRun(params: {
  teamId: number;
  runId: number;
  output?: string;
  durationSeconds?: number;
  status?: 'completed' | 'failed';
  error?: string | null;
}) {
  const run = await db.query.voiceAgentRuns.findFirst({
    where: and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)),
  });

  if (!run) throw new Error('Voice run not found');

  const actualCredits =
    params.status === 'failed'
      ? 0
      : calculateVoiceCredits({ durationSeconds: params.durationSeconds });

  await finalizeVoiceRunCredits({
    teamId: params.teamId,
    reservedCredits: run.reservedCredits,
    actualCredits,
    description: `Voice agent run reconciliation: #${run.id}`,
  });

  const messages = Array.isArray(run.messages) ? [...run.messages] : [];
  if (params.output) messages.push({ role: 'assistant', content: params.output, at: new Date().toISOString() });

  const [updated] = await db
    .update(voiceAgentRuns)
    .set({
      status: params.status ?? 'completed',
      transcript: [run.transcript, params.output].filter(Boolean).join('\n\n'),
      messages,
      creditsUsed: actualCredits,
      usage: {
        ...(run.usage as Record<string, any>),
        durationSeconds: params.durationSeconds ?? 0,
      },
      error: params.error ?? null,
      endedAt: new Date(),
    })
    .where(and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)))
    .returning();

  return updated;
}

export async function generateVoiceAgentReply(params: {
  teamId: number;
  agentId: number;
  input: string;
  contactName?: string | null;
}) {
  const agent = await db.query.voiceAgents.findFirst({
    where: and(eq(voiceAgents.teamId, params.teamId), eq(voiceAgents.id, params.agentId)),
  });
  if (!agent) throw new Error('Voice agent not found');

  const modelConfig = agent.modelConfigId
    ? await db.query.voiceModelConfigs.findFirst({
        where: and(eq(voiceModelConfigs.teamId, params.teamId), eq(voiceModelConfigs.id, agent.modelConfigId)),
      })
    : await db.query.voiceModelConfigs.findFirst({
        where: and(eq(voiceModelConfigs.teamId, params.teamId), eq(voiceModelConfigs.isDefault, true)),
      });

  const apiKey = modelConfig?.llmApiKey || process.env.OPENAI_API_KEY;
  const prompt = agent.systemPrompt || 'You are a helpful WhatsApp and voice assistant. Reply briefly and clearly.';

  if (!apiKey) {
    return agent.firstMessage || `Thanks${params.contactName ? ` ${params.contactName}` : ''}. I received your message and will help from here.`;
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: modelConfig?.llmModel || 'gpt-4o-mini',
    temperature: Number(modelConfig?.temperature ?? 0.7),
    max_tokens: modelConfig?.maxOutputTokens ?? 500,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: params.input },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || 'I received your message.';
}

export async function processWhatsappVoiceAgent(params: {
  teamId: number;
  chatId: number;
  instanceId: number;
  remoteJid: string;
  incomingText: string;
}) {
  const agent = await db.query.voiceAgents.findFirst({
    where: and(
      eq(voiceAgents.teamId, params.teamId),
      eq(voiceAgents.isActive, true),
      eq(voiceAgents.isDefaultForWhatsapp, true),
    ),
  });

  if (!agent) return false;

  const instance = await db.query.evolutionInstances.findFirst({
    where: and(eq(evolutionInstances.id, params.instanceId), eq(evolutionInstances.teamId, params.teamId)),
  });
  if (!instance) return false;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.chatId, params.chatId),
  });

  const { run } = await createVoiceRun({
    teamId: params.teamId,
    agentId: agent.id,
    channel: 'whatsapp',
    direction: 'inbound',
    input: params.incomingText,
    chatId: params.chatId,
    contactId: contact?.id ?? null,
    fromNumber: params.remoteJid,
    toNumber: instance.instanceName,
    reserveCredits: 1,
  });

  try {
    const reply = await generateVoiceAgentReply({
      teamId: params.teamId,
      agentId: agent.id,
      input: params.incomingText,
      contactName: contact?.name,
    });

    await sendTextViaProvider({
      instance: {
        id: instance.id,
        instanceName: instance.instanceName,
        accessToken: instance.accessToken || '',
        integration: instance.integration,
        metaToken: instance.metaToken,
        metaPhoneNumberId: instance.metaPhoneNumberId,
        metaBusinessId: instance.metaBusinessId,
      },
      recipientJid: params.remoteJid,
      text: reply,
      teamId: params.teamId,
      chatId: params.chatId,
      instanceId: params.instanceId,
    });

    await completeVoiceRun({
      teamId: params.teamId,
      runId: run.id,
      output: reply,
      durationSeconds: 1,
      status: 'completed',
    });
  } catch (error: any) {
    await completeVoiceRun({
      teamId: params.teamId,
      runId: run.id,
      status: 'failed',
      error: error?.message || 'Voice agent failed',
    });
    throw error;
  }

  return true;
}

export async function getVoiceReports(teamId: number) {
  const rows = await db
    .select({
      agentId: voiceAgentRuns.agentId,
      agentName: voiceAgents.name,
      runs: count(voiceAgentRuns.id),
      creditsUsed: sql<number>`coalesce(sum(${voiceAgentRuns.creditsUsed}), 0)`,
    })
    .from(voiceAgentRuns)
    .leftJoin(voiceAgents, eq(voiceAgentRuns.agentId, voiceAgents.id))
    .where(eq(voiceAgentRuns.teamId, teamId))
    .groupBy(voiceAgentRuns.agentId, voiceAgents.name)
    .orderBy(desc(sql`count(${voiceAgentRuns.id})`));

  return rows;
}
