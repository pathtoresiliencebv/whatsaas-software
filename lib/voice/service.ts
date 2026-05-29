import { and, count, desc, eq, sql } from 'drizzle-orm';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { AccessToken } from 'livekit-server-sdk';
import { GoogleGenAI } from '@google/genai';
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
  voiceFileChunks,
  voiceFiles,
  voiceModelConfigs,
  voicePhoneNumbers,
  voiceRecordings,
  voiceTelephonyConfigs,
  voiceTools,
} from '@/lib/db/schema';
import { sendTextViaProvider } from '@/lib/whatsapp/send-helpers';
import { buildVoiceCampaignLeadQueue } from './campaigns';
import { calculateVoiceCredits, finalizeVoiceRunCredits, reserveVoiceCredits } from './credits';
import { chunkVoiceKnowledgeDocument, retrieveVoiceKnowledge } from './knowledge';
import { getVoiceProviderCatalog } from './providers';
import {
  buildLiveKitAgentMetadata,
  buildLiveKitSipTwiML,
  buildPipecatWorkerConfig,
  buildTwilioMediaStreamTwiML,
  getRealtimeRuntimeConfig,
} from './realtime-runtime';
import { buildRuntimeSession, reduceRuntimeEvent, summarizeRunUsage, type VoiceRuntimeEvent } from './runtime';
import { executeVoiceTool } from './tools';
import {
  buildDefaultVoiceWorkflow,
  normalizeWorkflowDefinition,
  validateWorkflowDefinition,
  type VoiceWorkflowDefinition,
} from './workflow';

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
  userId?: number | null;
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
  channelMode?: string;
  isDefaultForWhatsapp?: boolean;
  metadata?: Record<string, any>;
  workflowJson?: Record<string, any>;
}) {
  const [agent] = await db
    .insert(voiceAgents)
    .values({
      teamId: params.teamId,
      createdBy: params.userId ?? null,
      name: params.name,
      description: params.description,
      systemPrompt: params.systemPrompt,
      channelMode: params.channelMode ?? 'whatsapp_voice',
      isDefaultForWhatsapp: params.isDefaultForWhatsapp ?? false,
      isActive: true,
      status: 'active',
      metadata: params.metadata ?? {},
    })
    .returning();

  const workflowJson = params.workflowJson
    ? normalizeWorkflowDefinition(params.workflowJson)
    : buildDefaultVoiceWorkflow({
        name: params.name,
        useCase: params.description || params.name,
        activityDescription: params.systemPrompt || params.description || undefined,
      });

  const validation = validateWorkflowDefinition(workflowJson);
  if (!validation.valid) {
    throw Object.assign(new Error(validation.errors.join(' ')), { status: 400, code: 'INVALID_VOICE_WORKFLOW' });
  }

  await db.insert(voiceAgentDefinitions).values({
    teamId: params.teamId,
    agentId: agent.id,
    version: 1,
    status: 'published',
    nodes: Array.isArray(workflowJson.nodes) ? workflowJson.nodes : [],
    edges: Array.isArray(workflowJson.edges) ? workflowJson.edges : [],
    workflowJson,
    publishedAt: new Date(),
  });

  if (params.isDefaultForWhatsapp) {
    await setDefaultWhatsappVoiceAgent(params.teamId, agent.id);
  }

  return agent;
}

export async function getVoiceAgentDefinition(teamId: number, agentId: number) {
  const definition = await db.query.voiceAgentDefinitions.findFirst({
    where: and(eq(voiceAgentDefinitions.teamId, teamId), eq(voiceAgentDefinitions.agentId, agentId)),
    orderBy: [desc(voiceAgentDefinitions.version)],
  });

  if (!definition) {
    throw Object.assign(new Error('Voice agent definition not found'), { status: 404 });
  }

  return definition;
}

export async function listVoiceAgentDefinitions(teamId: number, agentId: number, limit = 10) {
  return db.query.voiceAgentDefinitions.findMany({
    where: and(eq(voiceAgentDefinitions.teamId, teamId), eq(voiceAgentDefinitions.agentId, agentId)),
    orderBy: [desc(voiceAgentDefinitions.version)],
    limit,
  });
}

export async function saveVoiceAgentDefinition(params: {
  teamId: number;
  agentId: number;
  workflowJson: VoiceWorkflowDefinition | Record<string, any>;
  variables?: Record<string, any>;
}) {
  const latest = await getVoiceAgentDefinition(params.teamId, params.agentId).catch(() => null);
  const workflow = normalizeWorkflowDefinition(params.workflowJson);
  const validation = validateWorkflowDefinition(workflow);
  if (!validation.valid) {
    throw Object.assign(new Error(validation.errors.join(' ')), { status: 400, code: 'INVALID_VOICE_WORKFLOW' });
  }

  const nextVersion = latest?.status === 'draft' ? latest.version : (latest?.version ?? 0) + 1;

  if (latest?.status === 'draft') {
    const [updated] = await db
      .update(voiceAgentDefinitions)
      .set({
        nodes: workflow.nodes,
        edges: workflow.edges,
        workflowJson: workflow as any,
        variables: params.variables || workflow.variables || {},
      })
      .where(and(eq(voiceAgentDefinitions.teamId, params.teamId), eq(voiceAgentDefinitions.id, latest.id)))
      .returning();
    return { definition: updated, validation };
  }

  const [created] = await db
    .insert(voiceAgentDefinitions)
    .values({
      teamId: params.teamId,
      agentId: params.agentId,
      version: nextVersion,
      status: 'draft',
      nodes: workflow.nodes,
      edges: workflow.edges,
      workflowJson: workflow as any,
      variables: params.variables || workflow.variables || {},
    })
    .returning();

  return { definition: created, validation };
}

export async function publishVoiceAgentDefinition(params: {
  teamId: number;
  agentId: number;
  definitionId?: number;
}) {
  const definition = params.definitionId
    ? await db.query.voiceAgentDefinitions.findFirst({
        where: and(
          eq(voiceAgentDefinitions.teamId, params.teamId),
          eq(voiceAgentDefinitions.agentId, params.agentId),
          eq(voiceAgentDefinitions.id, params.definitionId),
        ),
      })
    : await getVoiceAgentDefinition(params.teamId, params.agentId);

  if (!definition) {
    throw Object.assign(new Error('Voice agent definition not found'), { status: 404 });
  }

  const validation = validateWorkflowDefinition({
    nodes: definition.nodes,
    edges: definition.edges,
  });
  if (!validation.valid) {
    throw Object.assign(new Error(validation.errors.join(' ')), { status: 400, code: 'INVALID_VOICE_WORKFLOW' });
  }

  await db
    .update(voiceAgentDefinitions)
    .set({ status: 'archived' })
    .where(and(eq(voiceAgentDefinitions.teamId, params.teamId), eq(voiceAgentDefinitions.agentId, params.agentId)));

  const [published] = await db
    .update(voiceAgentDefinitions)
    .set({ status: 'published', publishedAt: new Date() })
    .where(and(eq(voiceAgentDefinitions.teamId, params.teamId), eq(voiceAgentDefinitions.id, definition.id)))
    .returning();

  await db
    .update(voiceAgents)
    .set({
      status: 'active',
      isActive: true,
      updatedAt: new Date(),
      metadata: sql`coalesce(${voiceAgents.metadata}, '{}'::jsonb) || ${JSON.stringify({
        publishedDefinitionId: published.id,
        publishedVersion: published.version,
      })}::jsonb`,
    })
    .where(and(eq(voiceAgents.teamId, params.teamId), eq(voiceAgents.id, params.agentId)));

  return { definition: published, validation };
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

export async function updateVoiceAgent(params: {
  teamId: number;
  agentId: number;
  name?: string;
  description?: string | null;
  systemPrompt?: string | null;
  firstMessage?: string | null;
  defaultLanguage?: string;
  channelMode?: string;
  status?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}) {
  const values: Record<string, any> = { updatedAt: new Date() };
  const assignIfDefined = (key: string, value: unknown) => {
    if (value !== undefined) values[key] = value;
  };

  assignIfDefined('name', params.name);
  assignIfDefined('description', params.description);
  assignIfDefined('systemPrompt', params.systemPrompt);
  assignIfDefined('firstMessage', params.firstMessage);
  assignIfDefined('defaultLanguage', params.defaultLanguage);
  assignIfDefined('channelMode', params.channelMode);
  assignIfDefined('status', params.status);
  assignIfDefined('isActive', params.isActive);
  assignIfDefined('metadata', params.metadata);

  const [agent] = await db
    .update(voiceAgents)
    .set(values)
    .where(and(eq(voiceAgents.teamId, params.teamId), eq(voiceAgents.id, params.agentId)))
    .returning();

  if (!agent) {
    throw new Error('Voice agent not found');
  }

  return agent;
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

  const credits = Math.max(0, params.reserveCredits ?? 1);
  if (credits > 0) {
    await reserveVoiceCredits({
      teamId: params.teamId,
      credits,
      description: `Voice agent run reservation: ${agent.name}`,
    });
  }

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
      : run.reservedCredits === 0
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

export async function endVoiceRun(params: {
  teamId: number;
  runId: number;
  status?: 'completed' | 'failed';
  usage?: Record<string, any>;
  error?: string | null;
}) {
  const run = await db.query.voiceAgentRuns.findFirst({
    where: and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)),
  });
  if (!run) throw Object.assign(new Error('Voice run not found'), { status: 404 });

  const usageSummary = summarizeRunUsage(params.usage || {});
  const actualCredits = params.status === 'failed' ? 0 : usageSummary.totalCredits;

  await finalizeVoiceRunCredits({
    teamId: params.teamId,
    reservedCredits: run.reservedCredits,
    actualCredits,
    description: `Voice agent run reconciliation: #${run.id}`,
  });

  const messages = Array.isArray(run.messages) ? [...run.messages] : [];
  if (params.status !== 'failed') {
    messages.push({ role: 'system', content: 'Run ended by runtime.', at: new Date().toISOString() });
  }

  const [updated] = await db
    .update(voiceAgentRuns)
    .set({
      status: params.status || 'completed',
      messages,
      usage: { ...((run.usage as Record<string, any>) || {}), ...(params.usage || {}), credits: usageSummary },
      creditsUsed: actualCredits,
      error: params.error || null,
      endedAt: new Date(),
    })
    .where(and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)))
    .returning();

  return updated;
}

export async function ingestVoiceRuntimeEvent(params: {
  teamId: number;
  runId: number;
  event: VoiceRuntimeEvent;
}) {
  const run = await db.query.voiceAgentRuns.findFirst({
    where: and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)),
  });
  if (!run) throw Object.assign(new Error('Voice run not found'), { status: 404 });

  const usage = (run.usage as Record<string, any>) || {};
  const state = reduceRuntimeEvent(
    {
      messages: Array.isArray(run.messages) ? run.messages : [],
      transcript: run.transcript || '',
      usage,
      events: Array.isArray(usage.events) ? usage.events : [],
      status: run.status,
      error: run.error,
    },
    params.event,
  );

  const [updated] = await db
    .update(voiceAgentRuns)
    .set({
      messages: state.messages,
      transcript: state.transcript,
      usage: { ...state.usage, events: state.events },
      status: state.status || run.status,
      error: state.error ?? run.error,
      endedAt: params.event.type === 'run.ended' ? new Date() : run.endedAt,
    })
    .where(and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)))
    .returning();

  return updated;
}

export async function createVoiceWebCallSession(params: {
  teamId: number;
  userId: number;
  agentId: number;
}) {
  const { run, agent, definition } = await createVoiceRun({
    teamId: params.teamId,
    userId: params.userId,
    agentId: params.agentId,
    channel: 'browser',
    direction: 'inbound',
    input: 'Browser test call started.',
    reserveCredits: process.env.VOICE_TEST_CALLS_REQUIRE_CREDITS === 'true' ? 1 : 0,
  });

  const session = buildRuntimeSession({
    teamId: params.teamId,
    agentId: agent.id,
    runId: run.id,
    channel: 'browser',
  });

  const runtimeConfig = getRealtimeRuntimeConfig();
  const metadata = buildLiveKitAgentMetadata({
    session,
    agentName: runtimeConfig.agentName,
    callbackBaseUrl: runtimeConfig.publicBaseUrl,
    workflow: definition?.workflowJson || undefined,
    variables: run.variables || {},
  });
  const token = await createLiveKitAccessToken({
    identity: `team-${params.teamId}-user-${params.userId}`,
    roomName: session.roomName,
    agentName: runtimeConfig.agentName,
    metadata,
  });

  return {
    run,
    session,
    worker: buildPipecatWorkerConfig({
      session,
      livekitUrl: runtimeConfig.livekitUrl,
      agentName: runtimeConfig.agentName,
      callbackBaseUrl: runtimeConfig.publicBaseUrl,
      runtimeSecret: runtimeConfig.runtimeSecret,
      workflow: definition?.workflowJson || undefined,
      variables: run.variables || {},
    }),
    livekit: {
      url: runtimeConfig.livekitUrl,
      token,
      configured: runtimeConfig.livekitConfigured,
      agentName: runtimeConfig.agentName,
      dispatchMetadata: metadata,
    },
  };
}

export async function createInboundTwilioVoiceRuntime(params: {
  toNumber: string;
  fromNumber?: string | null;
  callSid?: string | null;
}) {
  const phoneNumber = await db.query.voicePhoneNumbers.findFirst({
    where: and(eq(voicePhoneNumbers.phoneNumber, params.toNumber), eq(voicePhoneNumbers.isActive, true)),
  });

  if (!phoneNumber?.agentId) {
    throw Object.assign(new Error('No active voice agent is mapped to this phone number'), { status: 404 });
  }

  const { run, agent, definition } = await createVoiceRun({
    teamId: phoneNumber.teamId,
    agentId: phoneNumber.agentId,
    channel: 'phone',
    direction: 'inbound',
    input: `Inbound call from ${params.fromNumber || 'unknown caller'}.`,
    fromNumber: params.fromNumber || null,
    toNumber: params.toNumber,
    reserveCredits: 1,
  });

  const session = buildRuntimeSession({
    teamId: phoneNumber.teamId,
    agentId: agent.id,
    runId: run.id,
    channel: 'phone',
  });
  const runtimeConfig = getRealtimeRuntimeConfig();
  const telephonyConfig = phoneNumber.telephonyConfigId
    ? await db.query.voiceTelephonyConfigs.findFirst({
        where: and(
          eq(voiceTelephonyConfigs.teamId, phoneNumber.teamId),
          eq(voiceTelephonyConfigs.id, phoneNumber.telephonyConfigId),
          eq(voiceTelephonyConfigs.isActive, true),
        ),
      })
    : null;
  const credentials = (telephonyConfig?.credentials || {}) as Record<string, any>;

  const canUseLiveKitSip = Boolean(credentials.sipHost && credentials.sipUsername && credentials.sipPassword);
  const websocketBaseUrl = runtimeConfig.websocketBaseUrl || runtimeConfig.publicBaseUrl;
  if (!canUseLiveKitSip && !websocketBaseUrl) {
    throw Object.assign(new Error('PIPECAT_WEBSOCKET_BASE_URL or NEXT_PUBLIC_APP_URL is required for Twilio Media Streams'), {
      status: 500,
    });
  }

  const twiml = canUseLiveKitSip
    ? buildLiveKitSipTwiML({
        sipHost: String(credentials.sipHost),
        sipUsername: String(credentials.sipUsername),
        sipPassword: String(credentials.sipPassword),
        phoneNumber: params.toNumber,
      })
    : buildTwilioMediaStreamTwiML({
        websocketBaseUrl: websocketBaseUrl!,
        session,
        callSid: params.callSid,
        from: params.fromNumber,
        to: params.toNumber,
      });

  return {
    run,
    session,
    twiml,
    transport: canUseLiveKitSip ? 'livekit-sip' : 'twilio-media-streams',
    worker: buildPipecatWorkerConfig({
      session,
      livekitUrl: runtimeConfig.livekitUrl,
      agentName: runtimeConfig.agentName,
      callbackBaseUrl: runtimeConfig.publicBaseUrl,
      runtimeSecret: runtimeConfig.runtimeSecret,
      workflow: definition?.workflowJson || undefined,
      variables: run.variables || {},
      transport: canUseLiveKitSip ? 'livekit' : 'twilio-media-streams',
    }),
  };
}

export async function getVoiceRuntimeWorkerConfig(params: {
  teamId: number;
  runId: number;
}) {
  const run = await db.query.voiceAgentRuns.findFirst({
    where: and(eq(voiceAgentRuns.teamId, params.teamId), eq(voiceAgentRuns.id, params.runId)),
  });
  if (!run) throw Object.assign(new Error('Voice run not found'), { status: 404 });

  const definition = run.definitionId
    ? await db.query.voiceAgentDefinitions.findFirst({
        where: and(eq(voiceAgentDefinitions.teamId, params.teamId), eq(voiceAgentDefinitions.id, run.definitionId)),
      })
    : null;
  const runtimeConfig = getRealtimeRuntimeConfig();
  const session = buildRuntimeSession({
    teamId: run.teamId,
    agentId: run.agentId,
    runId: run.id,
    channel: run.channel as any,
  });
  const providers = await getVoiceRunProviderConfig(run);

  return buildPipecatWorkerConfig({
    session,
    livekitUrl: runtimeConfig.livekitUrl,
    agentName: runtimeConfig.agentName,
    callbackBaseUrl: runtimeConfig.publicBaseUrl,
    runtimeSecret: runtimeConfig.runtimeSecret,
    workflow: definition?.workflowJson || undefined,
    variables: run.variables || {},
    transport: run.channel === 'phone' ? 'twilio-media-streams' : 'livekit',
    providers,
  });
}

async function getVoiceRunProviderConfig(run: typeof voiceAgentRuns.$inferSelect) {
  const agent = await db.query.voiceAgents.findFirst({
    where: and(eq(voiceAgents.teamId, run.teamId), eq(voiceAgents.id, run.agentId)),
  });

  const modelConfig = agent?.modelConfigId
    ? await db.query.voiceModelConfigs.findFirst({
        where: and(eq(voiceModelConfigs.teamId, run.teamId), eq(voiceModelConfigs.id, agent.modelConfigId)),
      })
    : await db.query.voiceModelConfigs.findFirst({
        where: and(eq(voiceModelConfigs.teamId, run.teamId), eq(voiceModelConfigs.isDefault, true)),
      });

  return {
    llm: modelConfig?.llmProvider || process.env.LLM_PROVIDER || 'gemini-live',
    llmModel: modelConfig?.llmModel || process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview',
    stt: modelConfig?.sttProvider || process.env.STT_PROVIDER || 'deepgram',
    sttModel: modelConfig?.sttModel || process.env.DEEPGRAM_MODEL || 'nova-3',
    tts: modelConfig?.ttsProvider || process.env.TTS_PROVIDER || 'google-chirp',
    ttsModel: modelConfig?.ttsModel || process.env.GOOGLE_TTS_MODEL || 'chirp-3-hd',
    ttsVoice: modelConfig?.ttsVoice || process.env.GOOGLE_TTS_VOICE || process.env.ELEVENLABS_VOICE_ID || null,
    credentials: {
      llmApiKey: modelConfig?.llmApiKey || getDefaultLlmApiKey(modelConfig?.llmProvider || process.env.LLM_PROVIDER || 'gemini-live'),
      sttApiKey: modelConfig?.sttApiKey || process.env.DEEPGRAM_API_KEY || null,
      ttsApiKey: modelConfig?.ttsApiKey || getDefaultTtsApiKey(modelConfig?.ttsProvider || process.env.TTS_PROVIDER || 'google-chirp'),
    },
  };
}

function getDefaultLlmApiKey(provider: string) {
  if (provider === 'gemini' || provider === 'gemini-live') {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  }
  if (provider === 'qwen') return process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY || null;
  if (provider === 'minimax') return process.env.MINIMAX_API_KEY || null;
  return process.env.OPENAI_API_KEY || null;
}

function getDefaultTtsApiKey(provider: string) {
  if (provider === 'google-chirp' || provider === 'gemini-tts') {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  }
  if (provider === 'qwen') return process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY || null;
  if (provider === 'minimax') return process.env.MINIMAX_API_KEY || null;
  if (provider === 'openai') return process.env.OPENAI_API_KEY || null;
  return process.env.ELEVENLABS_API_KEY || null;
}

export async function executeTeamVoiceTool(params: {
  teamId: number;
  toolId: number;
  input?: Record<string, any>;
  variables?: Record<string, any>;
}) {
  const tool = await db.query.voiceTools.findFirst({
    where: and(eq(voiceTools.teamId, params.teamId), eq(voiceTools.id, params.toolId)),
  });
  if (!tool) throw Object.assign(new Error('Voice tool not found'), { status: 404 });

  return executeVoiceTool({
    tool: {
      name: tool.name,
      category: tool.category,
      definition: tool.definition || {},
    },
    input: params.input,
    variables: params.variables,
  });
}

export async function createVoiceFileWithChunks(params: {
  teamId: number;
  userId: number;
  name: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  storageUrl?: string | null;
  contentText?: string | null;
  metadata?: Record<string, any>;
}) {
  const [file] = await db
    .insert(voiceFiles)
    .values({
      teamId: params.teamId,
      createdBy: params.userId,
      name: params.name,
      mimeType: params.mimeType || 'text/plain',
      sizeBytes: params.sizeBytes || null,
      storageUrl: params.storageUrl || null,
      contentText: params.contentText || '',
      processingStatus: params.contentText ? 'ready' : 'uploaded',
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (params.contentText?.trim()) {
    const chunks = chunkVoiceKnowledgeDocument({ fileId: file.id, text: params.contentText });
    if (chunks.length > 0) {
      await db.insert(voiceFileChunks).values(
        chunks.map((chunk) => ({
          teamId: params.teamId,
          fileId: file.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          metadata: chunk.metadata || {},
        })),
      );
    }
  }

  return file;
}

export async function searchVoiceKnowledge(params: {
  teamId: number;
  query: string;
  limit?: number;
}) {
  const chunks = await db
    .select({
      fileId: voiceFileChunks.fileId,
      chunkIndex: voiceFileChunks.chunkIndex,
      content: voiceFileChunks.content,
      metadata: voiceFileChunks.metadata,
    })
    .from(voiceFileChunks)
    .where(eq(voiceFileChunks.teamId, params.teamId))
    .limit(500);

  return retrieveVoiceKnowledge({
    query: params.query,
    chunks,
    limit: params.limit || 4,
  });
}

export async function enqueueVoiceCampaignLeads(params: {
  teamId: number;
  campaignId: number;
  rows: Array<Record<string, any>>;
}) {
  const campaign = await db.query.voiceCampaigns.findFirst({
    where: and(eq(voiceCampaigns.teamId, params.teamId), eq(voiceCampaigns.id, params.campaignId)),
  });
  if (!campaign) throw Object.assign(new Error('Voice campaign not found'), { status: 404 });

  const queue = buildVoiceCampaignLeadQueue(params.rows);
  if (queue.validLeads.length > 0) {
    await db.insert(voiceCampaignLeads).values(
      queue.validLeads.map((lead) => ({
        teamId: params.teamId,
        campaignId: params.campaignId,
        phoneNumber: lead.phoneNumber,
        variables: lead.variables,
        status: 'queued',
        attempts: 0,
        createdAt: new Date(),
      })),
    );
  }

  const [updatedCampaign] = await db
    .update(voiceCampaigns)
    .set({
      totalLeads: sql`${voiceCampaigns.totalLeads} + ${queue.validLeads.length}`,
      updatedAt: new Date(),
    })
    .where(and(eq(voiceCampaigns.teamId, params.teamId), eq(voiceCampaigns.id, params.campaignId)))
    .returning();

  return {
    campaign: updatedCampaign,
    imported: queue.validLeads.length,
    rejectedRows: queue.rejectedRows,
  };
}

export async function updateVoiceCampaignStatus(params: {
  teamId: number;
  campaignId: number;
  action: 'start' | 'pause' | 'resume';
}) {
  const status = params.action === 'pause' ? 'paused' : 'running';
  const values: Record<string, any> = { status, updatedAt: new Date() };
  if (params.action === 'start') values.startedAt = new Date();

  const [campaign] = await db
    .update(voiceCampaigns)
    .set(values)
    .where(and(eq(voiceCampaigns.teamId, params.teamId), eq(voiceCampaigns.id, params.campaignId)))
    .returning();

  if (!campaign) throw Object.assign(new Error('Voice campaign not found'), { status: 404 });
  return campaign;
}

export async function getVoiceCatalog() {
  return {
    providers: getVoiceProviderCatalog(),
    voices: [
      {
        id: 'kyrn-hope',
        name: 'Hope',
        provider: 'elevenlabs',
        style: 'upbeat and clear',
        language: 'multilingual',
        isDefault: true,
      },
      {
        id: 'chatterbox-turbo-clone',
        name: 'Chatterbox Clone',
        provider: 'chatterbox',
        style: 'cloned reference voice',
        language: 'en',
        supportsCloning: true,
      },
      {
        id: 'minimax-speech-turbo',
        name: 'MiniMax Turbo',
        provider: 'minimax',
        style: 'fast realtime voice',
        language: 'multilingual',
      },
      {
        id: 'qwen-ethan',
        name: 'Qwen Ethan',
        provider: 'qwen',
        style: 'realtime assistant voice',
        language: 'multilingual',
      },
    ],
  };
}

async function createLiveKitAccessToken(params: {
  identity: string;
  roomName: string;
  agentName?: string;
  metadata?: string;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY || 'dev-livekit-key';
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiSecret) {
    return `dev.${Buffer.from(JSON.stringify({ ...params, apiKey })).toString('base64url')}`;
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: params.identity,
    ttl: '2h',
  });
  token.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  if (params.agentName) {
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: params.agentName,
          metadata: params.metadata,
        }),
      ],
    });
  }

  return token.toJwt();
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

  const llmProvider = modelConfig?.llmProvider || process.env.LLM_PROVIDER || 'gemini-live';
  const apiKey = modelConfig?.llmApiKey || getDefaultLlmApiKey(llmProvider);
  const prompt = agent.systemPrompt || 'You are a helpful WhatsApp and voice assistant. Reply briefly and clearly.';

  if (!apiKey) {
    return agent.firstMessage || `Dank je${params.contactName ? ` ${params.contactName}` : ''}. Ik heb je bericht ontvangen en help je vanaf hier verder.`;
  }

  if (llmProvider === 'gemini' || llmProvider === 'gemini-live') {
    try {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: normalizeGeminiTextModel(modelConfig?.llmModel || process.env.GEMINI_TEXT_MODEL || 'gemini-3.1-flash'),
        contents: `${prompt}\n\nUser: ${params.input}`,
        config: {
          temperature: Number(modelConfig?.temperature ?? 0.7),
          maxOutputTokens: modelConfig?.maxOutputTokens ?? 500,
        },
      });

      return response.text?.trim() || 'Ik heb je bericht ontvangen.';
    } catch (error) {
      console.warn('[voice] gemini reply failed, using fallback reply', error);
      return agent.firstMessage || `Dank je${params.contactName ? ` ${params.contactName}` : ''}. Ik heb je bericht ontvangen en help je vanaf hier verder.`;
    }
  }

  try {
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

    return completion.choices[0]?.message?.content?.trim() || 'Ik heb je bericht ontvangen.';
  } catch (error) {
    console.warn('[voice] model reply failed, using fallback reply', error);
    return agent.firstMessage || `Dank je${params.contactName ? ` ${params.contactName}` : ''}. Ik heb je bericht ontvangen en help je vanaf hier verder.`;
  }
}

function normalizeGeminiTextModel(model: string) {
  if (model.includes('-live')) return process.env.GEMINI_TEXT_MODEL || 'gemini-3.1-flash';
  if (model.includes('-tts')) return process.env.GEMINI_TEXT_MODEL || 'gemini-3.1-flash';
  return model;
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
