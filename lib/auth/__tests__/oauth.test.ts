import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db/drizzle', () => ({ db: {} }));
vi.mock('@/lib/db/queries', () => ({ getFreePlan: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({
  comparePasswords: vi.fn(),
  hashPassword: vi.fn(),
  setSession: vi.fn(),
}));

import { exchangeCodeForToken } from '../oauth';

describe('OAuth token exchange', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-client-secret',
      BASE_URL: 'https://kyrn.nl',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('exchanges Google authorization codes with form-encoded body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      }), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await exchangeCodeForToken('google', 'auth-code');

    expect(result.accessToken).toBe('access-token');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams),
      })
    );

    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('client_id')).toBe('google-client-id');
    expect(body.get('client_secret')).toBe('google-client-secret');
    expect(body.get('code')).toBe('auth-code');
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('redirect_uri')).toBe('https://kyrn.nl/api/auth/oauth/google');
  });
});
