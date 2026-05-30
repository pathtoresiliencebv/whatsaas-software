import { describe, expect, it } from 'vitest';
import { isOfficialWhatsAppIntegration, resolveWhatsAppIntegration } from '../official';

describe('official WhatsApp integration helpers', () => {
  it('recognizes WABA and Meta Cloud integrations', () => {
    expect(isOfficialWhatsAppIntegration('WHATSAPP-BUSINESS')).toBe(true);
    expect(isOfficialWhatsAppIntegration('META-CLOUD')).toBe(true);
    expect(isOfficialWhatsAppIntegration('WHATSAPP-BAILEYS')).toBe(false);
  });

  it('keeps a stored official integration when live provider details are missing', () => {
    expect(resolveWhatsAppIntegration('WHATSAPP-BUSINESS', null)).toBe('WHATSAPP-BUSINESS');
    expect(resolveWhatsAppIntegration('META-CLOUD', undefined)).toBe('META-CLOUD');
  });

  it('keeps a stored official integration when live provider details disagree', () => {
    expect(resolveWhatsAppIntegration('WHATSAPP-BUSINESS', 'WHATSAPP-BAILEYS')).toBe('WHATSAPP-BUSINESS');
  });

  it('falls back to live details for non-official integrations', () => {
    expect(resolveWhatsAppIntegration('WHATSAPP-BAILEYS', 'CUSTOM-LIVE')).toBe('CUSTOM-LIVE');
    expect(resolveWhatsAppIntegration('WHATSAPP-BAILEYS', null)).toBe('WHATSAPP-BAILEYS');
  });
});
