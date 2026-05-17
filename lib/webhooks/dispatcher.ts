import { db } from '@/lib/db/drizzle';
import { teamWebhooks, webhookDeliveries } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

export type WebhookEvent =
  | 'message.received'
  | 'message.sent'
  | 'contact.created'
  | 'contact.updated'
  | 'chat.opened'
  | 'chat.closed';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  teamId: number;
  data: Record<string, unknown>;
}

export async function dispatchWebhook(
  teamId: number,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const webhooks = await db
    .select()
    .from(teamWebhooks)
    .where(and(
      eq(teamWebhooks.teamId, teamId),
      eq(teamWebhooks.isActive, true)
    ));

  const subscribedWebhooks = webhooks.filter(w =>
    w.events.includes(event) || w.events.includes('*')
  );

  for (const webhook of subscribedWebhooks) {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      teamId,
      data,
    };

    await queueWebhookDelivery(webhook.id, payload);
  }
}

async function queueWebhookDelivery(
  webhookId: number,
  payload: WebhookPayload
): Promise<void> {
  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({
      webhookId,
      event: payload.event,
      payload,
      status: 'pending',
      attempts: 0,
    })
    .returning();

  await deliverWebhook(delivery.id);
}

async function deliverWebhook(deliveryId: number): Promise<void> {
  const [delivery] = await db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);

  if (!delivery) return;

  const [webhook] = await db
    .select()
    .from(teamWebhooks)
    .where(eq(teamWebhooks.id, delivery.webhookId))
    .limit(1);

  if (!webhook) return;

  const signature = generateSignature(JSON.stringify(delivery.payload), webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event,
      },
      body: JSON.stringify(delivery.payload),
    });

    if (response.ok) {
      await db
        .update(webhookDeliveries)
        .set({
          status: 'delivered',
          responseStatus: response.status,
          deliveredAt: new Date(),
        })
        .where(eq(webhookDeliveries.id, deliveryId));
    } else {
      const errorBody = await response.text();
      await handleDeliveryFailure(deliveryId, delivery.attempts + 1, response.status, errorBody, 'HTTP error');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    await handleDeliveryFailure(deliveryId, delivery.attempts + 1, 0, message, 'Network error');
  }
}

async function handleDeliveryFailure(
  deliveryId: number,
  attempts: number,
  responseStatus: number,
  responseBody: string,
  errorType: string
): Promise<void> {
  if (attempts >= MAX_RETRY_ATTEMPTS) {
    await db
      .update(webhookDeliveries)
      .set({
        status: 'failed',
        attempts,
        responseStatus,
        responseBody: responseBody?.substring(0, 1000),
        error: errorType,
      })
      .where(eq(webhookDeliveries.id, deliveryId));
    return;
  }

  await db
    .update(webhookDeliveries)
    .set({
      status: 'pending',
      attempts,
      responseStatus,
      responseBody: responseBody?.substring(0, 1000),
      error: errorType,
    })
    .where(eq(webhookDeliveries.id, deliveryId));

  setTimeout(
    () => deliverWebhook(deliveryId),
    RETRY_DELAYS[attempts - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
  );
}

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export { generateSignature };
