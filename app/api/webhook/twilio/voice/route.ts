import { db } from '@/lib/db/drizzle';
import { twilioConfigs, teamPhoneNumbers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createInboundTwilioVoiceRuntime } from '@/lib/voice/service';



function normalizeBrazilianNumber(number: string): string {
  
  let clean = number.replace(/[\s\-\(\)]/g, '');

  if (!clean.startsWith('+55')) return clean;

  
  const afterCountry = clean.slice(3); 

  
  if (afterCountry.length < 10) return clean; 

  const ddd = afterCountry.slice(0, 2);
  const subscriber = afterCountry.slice(2);

  
  if (subscriber.length === 8 && /^[6-9]/.test(subscriber)) {
    return `+55${ddd}9${subscriber}`;
  }

  return clean;
}


export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let formData: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        formData[key] = value;
      });
    } else {
      try {
        formData = await request.json();
      } catch {
        formData = {};
      }
    }

    let toNumber = formData['To'] || formData['to'];
    const fromIdentity = formData['From'] || formData['from'] || formData['Caller'] || '';

    if (toNumber) {
      toNumber = normalizeBrazilianNumber(toNumber);
    }

    if (!toNumber) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number provided.</Say></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml' } },
      );
    }

    const direction = formData['Direction'] || formData['direction'];
    const callSid = formData['CallSid'] || formData['callSid'] || null;
    if (!direction || direction.includes('inbound')) {
      try {
        const runtime = await createInboundTwilioVoiceRuntime({
          toNumber,
          fromNumber: fromIdentity,
          callSid,
        });

        return new Response(runtime.twiml, {
          status: 200,
          headers: {
            'Content-Type': 'text/xml',
            'X-Voice-Runtime-Transport': runtime.transport,
            'X-Voice-Run-Id': String(runtime.run.id),
          },
        });
      } catch (error: any) {
        if (error?.status !== 404) {
          console.error('[Twilio Voice Runtime]', error.message);
          return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response><Say>The voice agent is unavailable.</Say></Response>',
            { status: 200, headers: { 'Content-Type': 'text/xml' } },
          );
        }
      }
    }

    
    if (toNumber.startsWith('client:')) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Invalid destination.</Say></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml' } },
      );
    }

    
    let callerId = '';

    const teamMatch = fromIdentity.match(/team-(\d+)/);
    if (teamMatch) {
      const teamId = parseInt(teamMatch[1], 10);
      const phoneNum = await db.query.teamPhoneNumbers.findFirst({
        where: eq(teamPhoneNumbers.teamId, teamId),
      });
      if (phoneNum) {
        callerId = phoneNum.phoneNumber;
      }
    }

    
    if (!callerId) {
      const anyPhone = await db.query.teamPhoneNumbers.findFirst();
      if (anyPhone) {
        callerId = anyPhone.phoneNumber;
      }
    }

    
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL || '';
    const recordingCallback = baseUrl ? `${baseUrl}/api/webhook/twilio` : '/api/webhook/twilio';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial${callerId ? ` callerId="${callerId}"` : ''} answerOnBridge="true" record="record-from-answer-dual" recordingStatusCallback="${recordingCallback}" recordingStatusCallbackMethod="POST">
    <Number>${toNumber}</Number>
  </Dial>
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('[Twilio Voice TwiML]', error.message);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } },
    );
  }
}
