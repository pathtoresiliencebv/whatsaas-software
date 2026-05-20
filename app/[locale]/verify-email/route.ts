import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/auth/verify-email';
  return NextResponse.redirect(url);
}
