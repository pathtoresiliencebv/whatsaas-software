import { describe, expect, it, vi } from 'vitest';
import { executeVoiceTool } from '@/lib/voice/tools';

describe('voice tools', () => {
  it('executes a calculator tool safely', async () => {
    const result = await executeVoiceTool({
      tool: { name: 'Calculator', category: 'calculator', definition: {} },
      input: { expression: '(12 + 8) / 5' },
    });

    expect(result).toMatchObject({ ok: true, output: 4 });
  });

  it('returns structured end-call instructions', async () => {
    const result = await executeVoiceTool({
      tool: { name: 'End call', category: 'end_call', definition: { disposition: 'qualified' } },
      input: { reason: 'User is done' },
    });

    expect(result).toMatchObject({
      ok: true,
      action: 'end_call',
      output: { reason: 'User is done', disposition: 'qualified' },
    });
  });

  it('executes an HTTP tool with template variables', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ available: true }), { status: 200 }));

    const result = await executeVoiceTool({
      tool: {
        name: 'Check slot',
        category: 'http_api',
        definition: {
          method: 'POST',
          url: 'https://example.test/slots/{{contact_id}}',
          body: { day: '{{day}}' },
        },
      },
      input: { day: 'monday' },
      variables: { contact_id: 'c_123' },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.test/slots/c_123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ day: 'monday' }),
      }),
    );
    expect(result).toMatchObject({ ok: true, output: { available: true } });
  });
});
