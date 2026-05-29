import { NextResponse } from 'next/server';
import { Composio } from '@composio/core';
import { getTeamForUser, getUser } from '@/lib/db/queries';

function getBaseUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, '');
}

export async function GET(request: Request) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const apiKey = process.env.COMPOSIO_API_KEY;
  const authConfigId = process.env.COMPOSIO_AUTH_CONFIG_ID;

  if (!apiKey || !authConfigId) {
    return NextResponse.json(
      { error: 'Facebook login is not configured on the server.' },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const userId = `team-${team.id}-user-${user.id}`;
  const composio = new Composio({ apiKey });
  const connectionRequest = await composio.connectedAccounts.link(userId, authConfigId, {
    callbackUrl: `${baseUrl}/api/composio/callback`,
  });

  const redirectUrl =
    connectionRequest.redirectUrl ||
    (connectionRequest as unknown as { redirect_url?: string }).redirect_url;

  if (!redirectUrl) {
    return NextResponse.json(
      { error: 'Facebook login did not return an authentication URL.' },
      { status: 502 }
    );
  }

  return NextResponse.redirect(redirectUrl);
}
