import { db } from '@/lib/db/drizzle';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email';
import { hashPassword } from './session';

const TOKEN_EXPIRY_HOURS = 24;

export async function generateEmailVerificationToken(userId: number, email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  const hashedToken = await hashPassword(token);

  await db.insert(emailVerificationTokens).values({
    userId,
    token: hashedToken,
    expiresAt,
  });

  await sendVerificationEmail(email, token);

  return token;
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const allTokens = await db
    .select()
    .from(emailVerificationTokens)
    .where(gt(emailVerificationTokens.expiresAt, new Date()))
    .orderBy(emailVerificationTokens.createdAt);

  for (const tokenRecord of allTokens) {
    const isValid = await comparePasswords(token, tokenRecord.token);
    if (isValid) {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, tokenRecord.userId));

      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, tokenRecord.id));

      return { success: true };
    }
  }

  return { success: false, error: 'Invalid or expired verification token' };
}

export async function resendVerificationEmail(userId: number, email: string): Promise<{ success: boolean; error?: string }> {
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));

  await generateEmailVerificationToken(userId, email);
  return { success: true };
}

async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(plain, hashed);
}
