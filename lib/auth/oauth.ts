import { db } from '@/lib/db/drizzle';
import { users, oauthAccounts, teams, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { comparePasswords, hashPassword, setSession } from './session';
import { getFreePlan } from '@/lib/db/queries';

export type OAuthProvider = 'google' | 'github';

interface OAuthUserInfo {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export async function handleOAuthSignIn(
  oauthUser: OAuthUserInfo
): Promise<{ success: true; redirectTo?: string } | { success: false; error: string }> {
  const { provider, providerUserId, email, name, accessToken, refreshToken, expiresAt } = oauthUser;

  const existingOAuthAccount = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerUserId, providerUserId)
      )
    )
    .limit(1);

  if (existingOAuthAccount.length > 0) {
    const oauthAccount = existingOAuthAccount[0];

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, oauthAccount.userId))
      .limit(1);

    if (!user || user.deletedAt) {
      return { success: false, error: 'Account has been deleted' };
    }

    if (accessToken !== undefined) {
      await db
        .update(oauthAccounts)
        .set({ accessToken, refreshToken, expiresAt })
        .where(eq(oauthAccounts.id, oauthAccount.id));
    }

    await setSession(user);
    return { success: true };
  }

  const [existingUserByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existingUserByEmail) {
    await db.insert(oauthAccounts).values({
      userId: existingUserByEmail.id,
      provider,
      providerUserId,
      accessToken,
      refreshToken,
      expiresAt,
    });

    await setSession(existingUserByEmail);
    return { success: true };
  }

  const passwordHash = await hashPassword(crypto.randomUUID());

  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      role: 'owner',
      emailVerified: new Date(),
    })
    .returning();

  if (!newUser) {
    return { success: false, error: 'Failed to create user' };
  }

  await db.insert(oauthAccounts).values({
    userId: newUser.id,
    provider,
    providerUserId,
    accessToken,
    refreshToken,
    expiresAt,
  });

  const newTeam: typeof teams.$inferSelect = {
    id: 0,
    name: `${email.split('@')[0]}'s Team`,
    planId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeProductId: null,
    gatewayType: null,
    gatewayCustomerId: null,
    gatewaySubscriptionId: null,
    planName: null,
    subscriptionStatus: null,
    isCanceled: false,
    trialEndsAt: null,
  };

  const [createdTeam] = await db.insert(teams).values({ name: newTeam.name }).returning();

  const freePlan = await getFreePlan();
  if (freePlan) {
    await db
      .update(teams)
      .set({
        planId: freePlan.id,
        subscriptionStatus: 'active',
      })
      .where(eq(teams.id, createdTeam.id));
    newTeam.planId = freePlan.id;
    newTeam.subscriptionStatus = 'active';
  }

  await db.insert(teamMembers).values({
    userId: newUser.id,
    teamId: createdTeam.id,
    role: 'owner',
  });

  newTeam.id = createdTeam.id;
  await setSession(newUser);

  return { success: true };
}

export function getGoogleOAuthUrl(state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.BASE_URL}/api/auth/oauth/google`;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  if (state) {
    params.set('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGitHubOAuthUrl(state?: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BASE_URL}/api/auth/oauth/github`;

  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email',
  });

  if (state) {
    params.set('state', state);
  }

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  if (provider === 'google') {
    return exchangeGoogleCode(code);
  } else if (provider === 'github') {
    return exchangeGitHubCode(code);
  }
  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

async function exchangeGoogleCode(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.BASE_URL}/api/auth/oauth/google`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
  };
}

async function exchangeGitHubCode(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const text = await response.text();
  const params = new URLSearchParams(text);

  const accessToken = params.get('access_token');
  if (!accessToken) {
    throw new Error('No access token returned');
  }

  return { accessToken };
}

export async function getGoogleUserInfo(accessToken: string): Promise<{ id: string; email: string; name?: string }> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();

  return {
    id: data.id,
    email: data.email,
    name: data.name,
  };
}

export async function getGitHubUserInfo(accessToken: string): Promise<{ id: string; email: string; name?: string }> {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to get user info');
  }

  const userData = await userResponse.json();

  let email = userData.email;
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (emailsResponse.ok) {
      const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsResponse.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }
  }

  if (!email) {
    throw new Error('No email found for GitHub user');
  }

  return {
    id: userData.id.toString(),
    email,
    name: userData.name || userData.login,
  };
}
