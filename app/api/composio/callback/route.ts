import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const incomingUrl = new URL(request.url);
  const status = incomingUrl.searchParams.get('status') || 'success';
  const connectedAccountId =
    incomingUrl.searchParams.get('connected_account_id') ||
    incomingUrl.searchParams.get('connectedAccountId') ||
    '';

  const redirectUrl = new URL('/settings/connect', incomingUrl.origin);
  redirectUrl.searchParams.set('composio', status);
  if (connectedAccountId) {
    redirectUrl.searchParams.set('connectedAccountId', connectedAccountId);
  }

  return NextResponse.redirect(redirectUrl);
}
