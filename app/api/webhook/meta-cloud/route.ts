import { NextResponse } from 'next/server';
import { isPluginInstalled } from '@/lib/plugins/registry';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (!mode && !token && !challenge) {
    return NextResponse.json({
      ok: true,
      service: 'meta-cloud-webhook',
      verification: 'Provide hub.mode=subscribe, hub.verify_token, and hub.challenge to verify with Meta.',
    });
  }

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Meta Webhook] Verification successful');
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  console.warn('[Meta Webhook] Verification failed. Token mismatch.');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: Request) {
  const limited = checkRateLimit(`webhook:meta:${getClientIp(request)}`, RATE_LIMITS.webhook);
  if (limited) return limited;

  try {
    if (!isPluginInstalled('meta-cloud')) {
      return NextResponse.json({ error: 'Meta Cloud plugin not installed' }, { status: 400 });
    }

    const bodyRaw = await request.text();

    // ─── X-Hub-Signature-256 Verification ──────────────────────────────────────
    // Meta Cloud sends HMAC-SHA256 signature of the body. Verify to prevent spoofed webhooks.
    const signature = request.headers.get('x-hub-signature-256') ||
      request.headers.get('x-meta-signature');

    const appSecret = process.env.META_APP_SECRET || '';
    if (appSecret && signature) {
      const crypto = await import('crypto');
      const expected = 'sha256=' + crypto.createHmac('sha256', appSecret)
        .update(bodyRaw)
        .digest('hex');
      if (signature !== expected) {
        console.warn('[Meta Webhook] Signature verification failed.');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = JSON.parse(bodyRaw);

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ received: true, ignored: true });
    }

    const entries = body.entry;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ received: true });
    }

    const { processMetaWebhook } = await import('@/lib/plugins/meta-cloud/webhook-handler');

    processMetaWebhook(entries).catch((e) => {
      console.error('[Meta Webhook] Processing error:', e);
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Meta Webhook] Error:', error.message);
    return NextResponse.json({ received: true });
  }
}
