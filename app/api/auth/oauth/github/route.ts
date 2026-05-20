import { NextRequest, NextResponse } from 'next/server';
import {
  handleOAuthSignIn,
  exchangeCodeForToken,
  getGitHubUserInfo,
  getGitHubOAuthUrl,
} from '@/lib/auth/oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=oauth_${error}`, request.url)
    );
  }

  if (!code) {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/sign-in?error=oauth_not_configured', request.url)
      );
    }
    const authorizationUrl = getGitHubOAuthUrl(state || undefined);
    return NextResponse.redirect(new URL(authorizationUrl));
  }

  try {
    const tokenData = await exchangeCodeForToken('github', code);
    const userInfo = await getGitHubUserInfo(tokenData.accessToken);

    const result = await handleOAuthSignIn({
      provider: 'github',
      providerUserId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokenData.accessToken,
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }

    const redirectTo = state ? decodeURIComponent(state) : '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return NextResponse.redirect(
      new URL('/sign-in?error=oauth_failed', request.url)
    );
  }
}
