import { describe, expect, it, vi } from 'vitest';
import {
  calculateVoiceCredits,
  finalizeVoiceRunCredits,
  reserveVoiceCredits,
} from '@/lib/voice/credits';

describe('voice credits', () => {
  it('rounds voice usage up to whole minute credits', () => {
    expect(calculateVoiceCredits({ durationSeconds: 0 })).toBe(1);
    expect(calculateVoiceCredits({ durationSeconds: 1 })).toBe(1);
    expect(calculateVoiceCredits({ durationSeconds: 60 })).toBe(1);
    expect(calculateVoiceCredits({ durationSeconds: 61 })).toBe(2);
  });

  it('blocks a reservation when the team balance is too low', async () => {
    await expect(
      reserveVoiceCredits(
        { teamId: 7, credits: 3, description: 'Voice run reservation' },
        {
          getCreditsBalance: async () => 2,
          addCredits: vi.fn(),
        },
      ),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_VOICE_CREDITS' });
  });

  it('reserves and reconciles unused credits', async () => {
    const addCredits = vi.fn(async () => 8);

    await reserveVoiceCredits(
      { teamId: 7, credits: 3, description: 'Voice run reservation' },
      {
        getCreditsBalance: async () => 10,
        addCredits,
      },
    );

    await finalizeVoiceRunCredits(
      {
        teamId: 7,
        reservedCredits: 3,
        actualCredits: 1,
        description: 'Voice run reconciliation',
      },
      { addCredits },
    );

    expect(addCredits).toHaveBeenNthCalledWith(1, 7, -3, undefined, 'Voice run reservation');
    expect(addCredits).toHaveBeenNthCalledWith(2, 7, 2, undefined, 'Voice run reconciliation');
  });
});
