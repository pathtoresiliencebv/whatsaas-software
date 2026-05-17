import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth/email-verification';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  const result = await verifyEmail(token);

  if (!result.success) {
    return NextResponse.redirect(new URL('/sign-in?error=verification_failed', request.url));
  }

  return NextResponse.redirect(new URL('/dashboard?email_verified=true', request.url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifySchema.parse(body);

    const result = await verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
