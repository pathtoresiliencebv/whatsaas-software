import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getAuthenticatedTeam } from '@/lib/auth/api';
import { db } from '@/lib/db/drizzle';
import { chats, evolutionInstances } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const team = await getAuthenticatedTeam(request);
  if (!team) return NextResponse.json({ error: 'Unauthorized. Invalid or missing API Token.' }, { status: 401 });

  const url = new URL(request.url);
  const instanceName = url.searchParams.get('instanceName');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const rows = await db
    .select({
      id: chats.id,
      instanceName: evolutionInstances.instanceName,
      remoteJid: chats.remoteJid,
      name: chats.name,
      pushName: chats.pushName,
      lastMessageText: chats.lastMessageText,
      lastMessageTimestamp: chats.lastMessageTimestamp,
      unreadCount: chats.unreadCount,
      lastMessageStatus: chats.lastMessageStatus,
      lastMessageFromMe: chats.lastMessageFromMe,
    })
    .from(chats)
    .leftJoin(evolutionInstances, eq(chats.instanceId, evolutionInstances.id))
    .where(and(
      eq(chats.teamId, team.id),
      ...(instanceName ? [eq(evolutionInstances.instanceName, instanceName)] : []),
    ))
    .orderBy(desc(chats.lastMessageTimestamp))
    .limit(limit);

  return NextResponse.json({ chats: rows });
}
