export const OFFICIAL_WHATSAPP_INTEGRATIONS = ['WHATSAPP-BUSINESS', 'META-CLOUD'] as const;

export function isOfficialWhatsAppIntegration(integration?: string | null) {
  return OFFICIAL_WHATSAPP_INTEGRATIONS.includes(integration as typeof OFFICIAL_WHATSAPP_INTEGRATIONS[number]);
}

