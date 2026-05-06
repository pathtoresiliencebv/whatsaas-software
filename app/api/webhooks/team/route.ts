import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamWebhooks } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { z } from 'zod';

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()),
});

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    return NextResponse.json({ error: 'No team found' }, { status: 403 });
  }

  const webhooks = await db
    .select({
      id: teamWebhooks.id,
      name: teamWebhooks.name,
      url: teamWebhooks.url,
      events: teamWebhooks.events,
      isActive: teamWebhooks.isActive,
      createdAt: teamWebhooks.createdAt,
    })
    .from(teamWebhooks)
    .where(eq(teamWebhooks.teamId, userWithTeam.teamId));

  return NextResponse.json(webhooks);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'No team found' }, { status: 403 });
    }

    const body = await request.json();
    const data = createWebhookSchema.parse(body);

    const secret = crypto.randomBytes(32).toString('hex');

    const [webhook] = await db
      .insert(teamWebhooks)
      .values({
        teamId: userWithTeam.teamId,
        name: data.name,
        url: data.url,
        secret,
        events: data.events,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    console.error('Webhook creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
