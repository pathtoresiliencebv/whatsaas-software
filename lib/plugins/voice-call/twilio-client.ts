import twilio from 'twilio';
import type { TwilioConfig } from '@/lib/db/schema';

type TwilioClientConfig = Pick<
  TwilioConfig,
  'accountSid' | 'authToken' | 'apiKeySid' | 'apiKeySecret' | 'twimlAppSid'
>;

function assertTwilioConfig(config?: Partial<TwilioClientConfig> | null) {
  if (!config?.accountSid || !config?.authToken) {
    throw new Error('No active Twilio configuration is available');
  }
}

export function createTwilioClient(config?: Partial<TwilioClientConfig> | null) {
  assertTwilioConfig(config);
  return twilio(config!.accountSid!, config!.authToken!);
}

export async function getTwilioNumbers(config?: Partial<TwilioClientConfig> | null) {
  const client = createTwilioClient(config);
  const numbers = await client.incomingPhoneNumbers.list({ limit: 100 });

  return numbers.map((number) => ({
    sid: number.sid,
    phoneNumber: number.phoneNumber,
    friendlyName: number.friendlyName,
    capabilities: number.capabilities,
  }));
}
