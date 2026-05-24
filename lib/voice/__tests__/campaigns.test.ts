import { describe, expect, it } from 'vitest';
import {
  buildVoiceCampaignLeadQueue,
  normalizeCampaignLead,
  nextCampaignLeadStatus,
} from '@/lib/voice/campaigns';

describe('voice campaigns', () => {
  it('normalizes campaign leads from CSV-style rows', () => {
    expect(
      normalizeCampaignLead({
        phone_number: '+31612345678',
        first_name: 'Jason',
        company: 'Kyrn',
      }),
    ).toMatchObject({
      phoneNumber: '+31612345678',
      variables: { first_name: 'Jason', company: 'Kyrn' },
    });
  });

  it('builds a queued lead list and rejects rows without phone numbers', () => {
    const result = buildVoiceCampaignLeadQueue([
      { phone: '+31611111111', name: 'Alice' },
      { name: 'No phone' },
      { phone_number: '+31622222222', segment: 'hot' },
    ]);

    expect(result.validLeads).toHaveLength(2);
    expect(result.rejectedRows).toHaveLength(1);
  });

  it('moves failed leads to retry or failed based on retry limit', () => {
    expect(nextCampaignLeadStatus({ currentAttempts: 0, maxRetries: 2, failed: true })).toBe('queued');
    expect(nextCampaignLeadStatus({ currentAttempts: 2, maxRetries: 2, failed: true })).toBe('failed');
    expect(nextCampaignLeadStatus({ currentAttempts: 0, maxRetries: 2, failed: false })).toBe('completed');
  });
});
