import twilio from 'twilio';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  callCreditTransactions,
  callCredits,
  callLogs,
  teamPhoneNumbers,
  twilioConfigs,
  type TwilioConfig,
} from '@/lib/db/schema';
import { createTwilioClient } from './twilio-client';

type InitiateCallParams = {
  to: string;
  from: string;
  teamId: number;
  userId?: number;
  chatId?: number | null;
};

type ClientTokenParams = {
  teamId: number;
  userId?: number;
};

const COMPLETED_STATUSES = new Set(['completed', 'failed', 'busy', 'no-answer', 'canceled']);

async function getActiveTwilioConfig(): Promise<TwilioConfig> {
  const config = await db.query.twilioConfigs.findFirst({
    where: eq(twilioConfigs.isActive, true),
  });

  if (!config) {
    throw new Error('No active Twilio configuration is available');
  }

  return config;
}

function normalizePhoneNumber(phoneNumber: string) {
  const trimmed = phoneNumber.trim();
  if (!trimmed) {
    throw new Error('Phone number is required');
  }

  return trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/[^\d]/g, '')}`;
}

function creditsForDuration(durationSeconds?: number) {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return Math.max(1, Math.ceil(durationSeconds / 60));
}

export async function initiateCall(params: InitiateCallParams) {
  const config = await getActiveTwilioConfig();
  const client = createTwilioClient(config);
  const to = normalizePhoneNumber(params.to);
  const from = normalizePhoneNumber(params.from);

  const call = await client.calls.create({
    to,
    from,
    ...(config.twimlAppSid
      ? { applicationSid: config.twimlAppSid }
      : { twiml: `<Response><Dial callerId="${from}">${to}</Dial></Response>` }),
  });

  const [log] = await db
    .insert(callLogs)
    .values({
      teamId: params.teamId,
      userId: params.userId ?? null,
      chatId: params.chatId ?? null,
      twilioCallSid: call.sid,
      direction: 'outbound',
      fromNumber: from,
      toNumber: to,
      status: call.status || 'initiated',
      startedAt: new Date(),
    })
    .returning();

  return {
    callSid: call.sid,
    callLogId: log.id,
    status: call.status,
  };
}

export async function getCallCredits(teamId: number) {
  const balance = await getCreditsBalance(teamId);
  return { credits: balance };
}

export async function purchaseCredits(teamId: number, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  await addCredits(teamId, Math.floor(amount), undefined, 'Manual credit purchase');
  return getCallCredits(teamId);
}

export async function generateClientToken(params: ClientTokenParams) {
  const config = await getActiveTwilioConfig();

  if (!config.apiKeySid || !config.apiKeySecret || !config.twimlAppSid) {
    throw new Error('Twilio client calling is not fully configured');
  }

  const identity = `team-${params.teamId}-user-${params.userId ?? 'anonymous'}`;
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const token = new AccessToken(config.accountSid, config.apiKeySid, config.apiKeySecret, {
    identity,
  });

  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: config.twimlAppSid,
      incomingAllow: true,
    }),
  );

  return { token: token.toJwt(), identity };
}

export async function getCreditsBalance(teamId: number) {
  const row = await db.query.callCredits.findFirst({
    where: eq(callCredits.teamId, teamId),
  });

  return row?.balance ?? 0;
}

export async function handleCallStatusUpdate(
  callSid: string,
  callStatus: string,
  callDuration?: number,
  recordingUrl?: string,
  recordingSid?: string,
) {
  const existing = await db.query.callLogs.findFirst({
    where: eq(callLogs.twilioCallSid, callSid),
  });

  if (!existing) {
    return { updated: false };
  }

  const normalizedStatus = callStatus || 'unknown';
  const shouldFinalize = COMPLETED_STATUSES.has(normalizedStatus);
  const creditsUsed =
    shouldFinalize && !existing.creditsUsed ? creditsForDuration(callDuration) : existing.creditsUsed;

  const [updatedLog] = await db
    .update(callLogs)
    .set({
      status: normalizedStatus,
      duration: callDuration ?? existing.duration,
      recordingUrl: recordingUrl ?? existing.recordingUrl,
      recordingSid: recordingSid ?? existing.recordingSid,
      creditsUsed,
      endedAt: shouldFinalize ? new Date() : existing.endedAt,
    })
    .where(eq(callLogs.id, existing.id))
    .returning();

  if (creditsUsed > 0 && creditsUsed !== existing.creditsUsed) {
    await db
      .insert(callCredits)
      .values({
        teamId: existing.teamId,
        balance: 0,
      })
      .onConflictDoNothing({ target: callCredits.teamId });

    await db
      .update(callCredits)
      .set({
        balance: sql<number>`greatest(${callCredits.balance} - ${creditsUsed}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(callCredits.teamId, existing.teamId));

    await db.insert(callCreditTransactions).values({
      teamId: existing.teamId,
      type: 'usage',
      amount: -creditsUsed,
      description: `Call ${callSid} (${callDuration ?? 0}s)`,
      callLogId: existing.id,
    });
  }

  return { updated: true, callLog: updatedLog };
}

export async function addCredits(teamId: number, amount: number, paymentIntentId?: string, note?: string) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  const roundedAmount = Math.floor(amount);

  await db
    .insert(callCredits)
    .values({
      teamId,
      balance: roundedAmount,
    })
    .onConflictDoUpdate({
      target: callCredits.teamId,
      set: {
        balance: sql<number>`${callCredits.balance} + ${roundedAmount}`,
        updatedAt: new Date(),
      },
    });

  await db.insert(callCreditTransactions).values({
    teamId,
    type: 'purchase',
    amount: roundedAmount,
    description: note || 'Voice credits added',
    stripePaymentIntentId: paymentIntentId || null,
  });

  return getCreditsBalance(teamId);
}

export async function provisionPhoneNumber(
  teamId: number,
  phoneNumber: string,
  subscriptionId: string | null,
) {
  const config = await getActiveTwilioConfig();
  const client = createTwilioClient(config);
  const normalizedNumber = normalizePhoneNumber(phoneNumber);

  const incomingNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: normalizedNumber,
    ...(config.twimlAppSid ? { voiceApplicationSid: config.twimlAppSid } : {}),
  });

  const [record] = await db
    .insert(teamPhoneNumbers)
    .values({
      teamId,
      phoneNumber: incomingNumber.phoneNumber || normalizedNumber,
      twilioPhoneSid: incomingNumber.sid,
      friendlyName: incomingNumber.friendlyName || null,
      stripeSubscriptionId: subscriptionId,
      isActive: true,
    })
    .returning();

  return record;
}
