import twilio from 'twilio';

export type TwilioClientConfig = {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  apiKeySecret?: string;
  twimlAppSid?: string | null;
};

export function createTwilioClient(config: TwilioClientConfig) {
  if (!config.accountSid || !config.authToken) {
    throw new Error('Twilio accountSid and authToken are required');
  }

  return twilio(config.accountSid, config.authToken);
}

export async function getTwilioNumbers(config: TwilioClientConfig, country = 'US') {
  const client = createTwilioClient(config);
  return client.availablePhoneNumbers(country).local.list({
    limit: 20,
    voiceEnabled: true,
  });
}
