import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { voiceAgents } from '@/lib/db/schema';
import { checkTenantRateLimit } from '@/lib/rate-limit';

const createVoiceAgentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  provider: z.string().min(1).max(50).default('openai'),
  model: z.string().min(1).max(100).default('gpt-realtime-2'),
  voice: z.string().min(1).max(100).default('alloy'),
  prompt: z.string().max(12000).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const team = await getAuthenticatedTeam(req);

    if (!team) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API Token.' },
        { status: 401 },
      );
    }

    const rateLimitResponse = checkTenantRateLimit(team.id, team.planName, 'api', req);
    if (rateLimitResponse) return rateLimitResponse;

    const agents = await db.query.voiceAgents.findMany({
      where: eq(voiceAgents.teamId, team.id),
      orderBy: [desc(voiceAgents.updatedAt)],
    });

    return NextResponse.json({ data: agents });
  } catch (error: any) {
    console.error('[API v1 Voice Agents GET]', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const team = await getAuthenticatedTeam(req);

    if (!team) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API Token.' },
        { status: 401 },
      );
    }

    const rateLimitResponse = checkTenantRateLimit(team.id, team.planName, 'api', req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = createVoiceAgentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const [agent] = await db
      .insert(voiceAgents)
      .values({
        teamId: team.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        provider: parsed.data.provider,
        model: parsed.data.model,
        voice: parsed.data.voice,
        prompt: parsed.data.prompt || null,
        config: parsed.data.config || {},
        status: 'draft',
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error: any) {
    console.error('[API v1 Voice Agents POST]', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
