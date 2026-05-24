import twilio from 'twilio';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  callCreditTransactions,
  callCredits,
  callLogs,
  teamPhoneNumbers,
  twilioConfigs,
} from '@/lib/db/schema';
import { enforceFeature } from '@/lib/limits';
import { createTwilioClient } from './twilio-client';

export async function initiateCall(params: { to: string; from: string; teamId: number }) {
  await enforceFeature(params.teamId, 'isVoiceCallsEnabled');

  const config = await getActiveTwilioConfig();
  const baseUrl = getBaseUrl();
  const client = createTwilioClient(config);

  const call = await client.calls.create({
    to: params.to,
    from: params.from,
    url: `${baseUrl}/api/webhook/twilio/voice`,
    method: 'POST',
    statusCallback: `${baseUrl}/api/webhook/twilio`,
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  });

  return { callSid: call.sid, status: call.status };
}

export async function getCallCredits(teamId: number) {
  return { credits: await getCreditsBalance(teamId) };
}

export async function purchaseCredits(teamId: number, amount: number) {
  return addCredits(teamId, amount, undefined, 'Manual credit purchase');
}

export async function generateClientToken(params: { teamId: number; userId?: number }) {
  await enforceFeature(params.teamId, 'isVoiceCallsEnabled');

  const config = await getActiveTwilioConfig();
  if (!config.twimlAppSid) {
    throw new Error('No TwiML App SID configured for voice calling');
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const identity = `team-${params.teamId}${params.userId ? `-user-${params.userId}` : ''}`;
  const token = new AccessToken(config.accountSid, config.apiKeySid, config.apiKeySecret, {
    identity,
  });

  token.addGrant(new VoiceGrant({
    outgoingApplicationSid: config.twimlAppSid,
    incomingAllow: false,
  }));

  return { token: token.toJwt(), identity };
}

export async function getCreditsBalance(teamId: number) {
  const credits = await db.query.callCredits.findFirst({
    where: eq(callCredits.teamId, teamId),
  });

  return credits?.balance ?? 0;
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

  if (!existing) return;

  const duration = callDuration && callDuration > 0 ? callDuration : existing.duration;
  const creditsUsed =
    callStatus === 'completed' && duration && duration > 0
      ? Math.max(1, Math.ceil(duration / 60))
      : existing.creditsUsed;

  await db
    .update(callLogs)
    .set({
      status: callStatus,
      duration,
      recordingUrl: recordingUrl ?? existing.recordingUrl,
      recordingSid: recordingSid ?? existing.recordingSid,
      creditsUsed,
      endedAt: ['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(callStatus)
        ? new Date()
        : existing.endedAt,
    })
    .where(eq(callLogs.id, existing.id));

  if (creditsUsed > 0 && existing.creditsUsed === 0) {
    await addCredits(existing.teamId, -creditsUsed, undefined, `Call ${callSid}`);
  }
}

export async function addCredits(teamId: number, amount: number, paymentIntentId?: string, note?: string) {
  await db
    .insert(callCredits)
    .values({ teamId, balance: amount, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: callCredits.teamId,
      set: {
        balance: sql`${callCredits.balance} + ${amount}`,
        updatedAt: new Date(),
      },
    });

  await db.insert(callCreditTransactions).values({
    teamId,
    type: amount >= 0 ? 'credit' : 'debit',
    amount,
    description: note || (amount >= 0 ? 'Credits added' : 'Credits used'),
    stripePaymentIntentId: paymentIntentId,
  });

  return getCreditsBalance(teamId);
}

export async function provisionPhoneNumber(teamId: number, phoneNumber: string, subscriptionId: string | null) {
  const config = await getActiveTwilioConfig();
  const client = createTwilioClient(config);
  const baseUrl = getBaseUrl();

  const existing = await db.query.teamPhoneNumbers.findFirst({
    where: and(
      eq(teamPhoneNumbers.teamId, teamId),
      eq(teamPhoneNumbers.phoneNumber, phoneNumber),
    ),
  });

  if (existing) return existing;

  let twilioPhoneSid: string | null = null;
  try {
    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber,
      voiceUrl: `${baseUrl}/api/webhook/twilio/voice`,
      voiceMethod: 'POST',
      statusCallback: `${baseUrl}/api/webhook/twilio`,
      statusCallbackMethod: 'POST',
    });
    twilioPhoneSid = purchased.sid;
  } catch (error: any) {
    if (error?.code !== 21450 && error?.code !== 21452) {
      throw error;
    }
  }

  const [record] = await db
    .insert(teamPhoneNumbers)
    .values({
      teamId,
      phoneNumber,
      twilioPhoneSid,
      stripeSubscriptionId: subscriptionId,
      friendlyName: phoneNumber,
      isActive: true,
    })
    .returning();

  return record;
}

async function getActiveTwilioConfig() {
  const config = await db.query.twilioConfigs.findFirst({
    where: eq(twilioConfigs.isActive, true),
  });

  if (!config) {
    throw new Error('No active Twilio configuration');
  }

  return config;
}

function getBaseUrl() {
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL or NEXT_PUBLIC_WEBHOOK_URL is required for voice calling');
  }

  return baseUrl.replace(/\/$/, '');
}
