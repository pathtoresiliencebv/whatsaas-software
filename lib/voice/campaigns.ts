export type NormalizedCampaignLead = {
  phoneNumber: string;
  variables: Record<string, any>;
};

export function normalizeCampaignLead(row: Record<string, any>): NormalizedCampaignLead | null {
  const phoneNumber = String(row.phone_number || row.phone || row.number || '').trim();
  if (!phoneNumber) return null;

  const variables = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !['phone_number', 'phone', 'number'].includes(key))
      .map(([key, value]) => [key, value ?? '']),
  );

  return { phoneNumber, variables };
}

export function buildVoiceCampaignLeadQueue(rows: Array<Record<string, any>>) {
  const validLeads: NormalizedCampaignLead[] = [];
  const rejectedRows: Array<{ row: Record<string, any>; reason: string }> = [];

  rows.forEach((row) => {
    const lead = normalizeCampaignLead(row);
    if (lead) {
      validLeads.push(lead);
    } else {
      rejectedRows.push({ row, reason: 'Missing phone_number' });
    }
  });

  return { validLeads, rejectedRows };
}

export function nextCampaignLeadStatus(params: {
  currentAttempts: number;
  maxRetries: number;
  failed: boolean;
}) {
  if (!params.failed) return 'completed';
  return params.currentAttempts < params.maxRetries ? 'queued' : 'failed';
}
