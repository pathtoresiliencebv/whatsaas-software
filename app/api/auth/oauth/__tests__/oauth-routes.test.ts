import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET as googleGet } from '../google/route';
import { GET as githubGet } from '../github/route';

vi.mock('@/lib/auth/oauth', () => ({
  handleOAuthSignIn: vi.fn(),
  exchangeCodeForToken: vi.fn(),
  getGoogleUserInfo: vi.fn(),
  getGitHubUserInfo: vi.fn(),
  getGoogleOAuthUrl: vi.fn(() => 'https://accounts.google.com/mock-oauth-url'),
  getGitHubOAuthUrl: vi.fn(() => 'https://github.com/mock-oauth-url'),
}));

import { getGoogleOAuthUrl, getGitHubOAuthUrl } from '@/lib/auth/oauth';

describe('OAuth Route Handlers Redirect Logic', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('Google OAuth GET Route', () => {
    it('redirects to sign-in with oauth_not_configured error if credentials are missing and code is missing', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      process.env.BASE_URL = 'http://localhost:3000';

      const req = new NextRequest('http://localhost:3000/api/auth/oauth/google');
      const res = await googleGet(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/sign-in?error=oauth_not_configured');
    });

    it('redirects to Google Authorization URL if credentials are configured and code is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
      process.env.BASE_URL = 'http://localhost:3000';

      const req = new NextRequest('http://localhost:3000/api/auth/oauth/google?state=some-state');
      const res = await googleGet(req);

      expect(getGoogleOAuthUrl).toHaveBeenCalledWith('some-state');
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://accounts.google.com/mock-oauth-url');
    });
  });

  describe('GitHub OAuth GET Route', () => {
    it('redirects to sign-in with oauth_not_configured error if credentials are missing and code is missing', async () => {
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;
      process.env.BASE_URL = 'http://localhost:3000';

      const req = new NextRequest('http://localhost:3000/api/auth/oauth/github');
      const res = await githubGet(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/sign-in?error=oauth_not_configured');
    });

    it('redirects to GitHub Authorization URL if credentials are configured and code is missing', async () => {
      process.env.GITHUB_CLIENT_ID = 'mock-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'mock-github-client-secret';
      process.env.BASE_URL = 'http://localhost:3000';

      const req = new NextRequest('http://localhost:3000/api/auth/oauth/github?state=some-state');
      const res = await githubGet(req);

      expect(getGitHubOAuthUrl).toHaveBeenCalledWith('some-state');
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://github.com/mock-oauth-url');
    });
  });
});
