import { NextRequest, NextResponse } from 'next/server';
import {
  handleOAuthSignIn,
  exchangeCodeForToken,
  getGoogleUserInfo,
  getGoogleOAuthUrl,
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
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/sign-in?error=oauth_not_configured', request.url)
      );
    }
    const authorizationUrl = getGoogleOAuthUrl(state || undefined);
    return NextResponse.redirect(new URL(authorizationUrl));
  }

  try {
    const tokenData = await exchangeCodeForToken('google', code);
    const userInfo = await getGoogleUserInfo(tokenData.accessToken);

    const result = await handleOAuthSignIn({
      provider: 'google',
      providerUserId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }

    const redirectTo = state ? decodeURIComponent(state) : '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(
      new URL('/sign-in?error=oauth_failed', request.url)
    );
  }
}
