// Voice call service stub - plugin not enabled

export async function initiateCall(params: { to: string; from: string; teamId: number }) {
  throw new Error('Voice call plugin is not enabled');
}

export async function getCallCredits(teamId: number) {
  return { credits: 0 };
}

export async function purchaseCredits(teamId: number, amount: number) {
  throw new Error('Voice call plugin is not enabled');
}

export async function generateClientToken(params: { teamId: number; userId?: number }) {
  // Return mock token for TypeScript compatibility
  return { token: 'mock-token', identity: `user-${params.teamId}` };
}

export async function getCreditsBalance(teamId: number) {
  return 0;
}

export async function handleCallStatusUpdate(
  callSid: string,
  callStatus: string,
  callDuration?: number,
  recordingUrl?: string,
  recordingSid?: string,
) {
  throw new Error('Voice call plugin is not enabled');
}

export async function addCredits(teamId: number, amount: number, currency?: string, note?: string) {
  return 0;
}

export async function provisionPhoneNumber(teamId: number, phoneNumber: string, subscriptionId: string | null) {
  throw new Error('Voice call plugin is not enabled');
}
