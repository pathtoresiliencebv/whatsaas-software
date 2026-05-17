import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verify2FA as verify2FAUtil } from '@/lib/auth/2fa';
import { setSession } from '@/lib/auth/session';
import { z } from 'zod';

const verifyLoginSchema = z.object({
  userId: z.number(),
  token: z.string().min(6).max(10),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token, email } = verifyLoginSchema.parse(body);

    const result = await verify2FAUtil(userId, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.isBackupCode ? 'Backup code has been used' : 'Invalid verification code' },
        { status: 400 }
      );
    }

    const userWithTeam = await db
      .select({
        user: users,
        team: teams
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.email, email))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { user: foundUser } = userWithTeam[0];

    await setSession(foundUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('2FA verify login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
