export const DEFAULT_VOICE_RUN_CREDIT_RESERVATION = 1;

export class InsufficientVoiceCreditsError extends Error {
  code = 'INSUFFICIENT_VOICE_CREDITS';
  status = 402;

  constructor(message = 'Insufficient voice credits') {
    super(message);
    this.name = 'InsufficientVoiceCreditsError';
  }
}

type CreditDeps = {
  getCreditsBalance: (teamId: number) => Promise<number>;
  addCredits: (teamId: number, amount: number, currency?: string, note?: string) => Promise<number>;
};

const defaultDeps: CreditDeps = {
  getCreditsBalance: async (teamId) => {
    const service = await import('@/lib/plugins/voice-call/service');
    return service.getCreditsBalance(teamId);
  },
  addCredits: async (teamId, amount, currency, note) => {
    const service = await import('@/lib/plugins/voice-call/service');
    return service.addCredits(teamId, amount, currency, note);
  },
};

export function calculateVoiceCredits(params: {
  durationSeconds?: number | null;
  minimumCredits?: number;
}) {
  const minimumCredits = params.minimumCredits ?? DEFAULT_VOICE_RUN_CREDIT_RESERVATION;
  const durationSeconds = Math.max(0, params.durationSeconds ?? 0);
  return Math.max(minimumCredits, Math.ceil(durationSeconds / 60));
}

export async function reserveVoiceCredits(
  params: { teamId: number; credits: number; description: string },
  deps: CreditDeps = defaultDeps,
) {
  const credits = Math.max(1, Math.ceil(params.credits));
  const balance = await deps.getCreditsBalance(params.teamId);

  if (balance < credits) {
    throw new InsufficientVoiceCreditsError(
      `This team needs ${credits} voice credit(s), but only has ${balance}.`,
    );
  }

  await deps.addCredits(params.teamId, -credits, undefined, params.description);
  return { reservedCredits: credits, balanceBefore: balance };
}

export async function finalizeVoiceRunCredits(
  params: {
    teamId: number;
    reservedCredits: number;
    actualCredits: number;
    description: string;
  },
  deps: Pick<CreditDeps, 'addCredits'> = defaultDeps,
) {
  const reservedCredits = Math.max(0, Math.ceil(params.reservedCredits));
  const actualCredits = Math.max(0, Math.ceil(params.actualCredits));
  const delta = reservedCredits - actualCredits;

  if (delta === 0) return { delta: 0 };

  await deps.addCredits(params.teamId, delta, undefined, params.description);
  return { delta };
}
