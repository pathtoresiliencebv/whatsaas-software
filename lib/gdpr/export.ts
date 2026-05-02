import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, contacts, chats, activityLogs, invitations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface GdprExport {
  exportedAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    emailVerified: Date | null;
    twoFactorEnabled: boolean;
    createdAt: Date;
  };
  teamMemberships: Array<{
    role: string;
    permissions: unknown;
    joinedAt: Date;
    team: {
      id: number;
      name: string;
      planName: string | null;
      subscriptionStatus: string | null;
    };
  }>;
  contacts: Array<{
    id: number;
    name: string;
    notes: string | null;
    customData: Record<string, unknown>;
    funnelStageId: number | null;
    assignedUserId: number | null;
    assignedDepartmentId: number | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  chatOverview: Array<{
    id: number;
    name: string | null;
    remoteJid: string;
    lastMessageText: string | null;
    lastMessageTimestamp: Date | null;
    unreadCount: number | null;
    createdAt: Date;
  }>;
  activityLogs: Array<{
    id: number;
    action: string;
    timestamp: Date;
    ipAddress: string | null;
  }>;
  invitationsSent: Array<{
    id: number;
    email: string;
    role: string;
    invitedAt: Date;
    status: string;
  }>;
}

export async function exportUserData(userId: number): Promise<GdprExport> {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.deletedAt, null))
  });

  if (!user) {
    throw new Error('User not found');
  }

  const memberships = await db.query.teamMembers.findMany({
    where: eq(teamMembers.userId, userId),
    with: {
      team: true
    }
  });

  const teamIds = memberships.map(m => m.teamId);

  let contactsList: typeof contacts.$inferSelect[] = [];
  let chatsList: typeof chats.$inferSelect[] = [];
  let activityList: typeof activityLogs.$inferSelect[] = [];
  let invitationsList: typeof invitations.$inferSelect[] = [];

  if (teamIds.length > 0) {
    const orConditions = teamIds.map(tid => eq(contacts.teamId, tid));
    const orClause = orConditions.length === 1 ? orConditions[0] : inArray(contacts.teamId, teamIds);
    contactsList = await db.query.contacts.findMany({
      where: orClause
    });

    const orConditionsChats = teamIds.map(tid => eq(chats.teamId, tid));
    const orClauseChats = orConditionsChats.length === 1 ? orConditionsChats[0] : inArray(chats.teamId, teamIds);
    chatsList = await db.query.chats.findMany({
      where: orClauseChats
    });

    const orConditionsActivity = teamIds.map(tid => eq(activityLogs.teamId, tid));
    const orClauseActivity = orConditionsActivity.length === 1 ? orConditionsActivity[0] : inArray(activityLogs.teamId, teamIds);
    activityList = await db.query.activityLogs.findMany({
      where: and(orClauseActivity, eq(activityLogs.userId, userId))
    });

    invitationsList = await db.query.invitations.findMany({
      where: and(
        inArray(invitations.teamId, teamIds),
        eq(invitations.invitedBy, userId)
      )
    });
  }

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt
    },
    teamMemberships: memberships.map(m => ({
      role: m.role,
      permissions: m.permissions,
      joinedAt: m.joinedAt,
      team: {
        id: m.team.id,
        name: m.team.name,
        planName: m.team.planName,
        subscriptionStatus: m.team.subscriptionStatus
      }
    })),
    contacts: contactsList.map(c => ({
      id: c.id,
      name: c.name,
      notes: c.notes,
      customData: c.customData || {},
      funnelStageId: c.funnelStageId,
      assignedUserId: c.assignedUserId,
      assignedDepartmentId: c.assignedDepartmentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    })),
    chatOverview: chatsList.map(c => ({
      id: c.id,
      name: c.name,
      remoteJid: c.remoteJid,
      lastMessageText: c.lastMessageText,
      lastMessageTimestamp: c.lastMessageTimestamp,
      unreadCount: c.unreadCount,
      createdAt: c.createdAt
    })),
    activityLogs: activityList.map(a => ({
      id: a.id,
      action: a.action,
      timestamp: a.timestamp,
      ipAddress: a.ipAddress
    })),
    invitationsSent: invitationsList.map(i => ({
      id: i.id,
      email: i.email,
      role: i.role,
      invitedAt: i.invitedAt,
      status: i.status
    }))
  };
}
