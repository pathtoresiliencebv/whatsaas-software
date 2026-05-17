import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { comparePasswords } from '@/lib/auth/session';
import { verifyTOTP, verifyBackupCode } from '@/lib/auth/2fa';
import { z } from 'zod';

const disableSchema = z.object({
  password: z.string().min(8),
  token: z.string().min(6).max(6),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password, token } = disableSchema.parse(body);

    const [existingUser] = await db
      .select({
        passwordHash: users.passwordHash,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorSecret: users.twoFactorSecret,
        twoFactorBackupCodes: users.twoFactorBackupCodes,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!existingUser.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    const isPasswordValid = await comparePasswords(password, existingUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    if (existingUser.twoFactorSecret) {
      const isValidToken = verifyTOTP(existingUser.twoFactorSecret, token);
      if (!isValidToken && existingUser.twoFactorBackupCodes) {
        const hashedCodes: string[] = JSON.parse(existingUser.twoFactorBackupCodes);
        const backupResult = await verifyBackupCode(hashedCodes, token);
        if (!backupResult.valid) {
          return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }
      } else if (!isValidToken) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }
    }

    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
