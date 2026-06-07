import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser } from '@/lib/db/queries';
import { teamBrains, type TeamBrainSnapshot } from '@/lib/db/schema';

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
}

function normalizeWebsiteUrl(input: string) {
  const withProtocol = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  const url = new URL(withProtocol);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Gebruik een geldige website-url.');
  }

  return url.toString();
}

function pickMatches(html: string, pattern: RegExp, limit: number) {
  const matches = [...html.matchAll(pattern)]
    .map((match) => stripHtml(match[1] || ''))
    .filter((value) => value.length > 2);

  return [...new Set(matches)].slice(0, limit);
}

function extractMeta(html: string, name: string) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return decodeHtml(html.match(pattern)?.[1] || '');
}

function buildCentralPrompt(params: {
  title?: string;
  description?: string;
  highlights: string[];
  audience: string[];
  goal: string;
}) {
  const lines = [
    'Je bent de Kyrn AI voor deze workspace.',
    params.title ? `Bedrijf: ${params.title}.` : null,
    params.description ? `Kernbeschrijving: ${params.description}.` : null,
    params.highlights.length ? `Belangrijke context: ${params.highlights.join(' | ')}` : null,
    params.audience.length ? `Doelgroep: ${params.audience.join(', ')}.` : null,
    `Hoofddoel: ${params.goal || 'support, sales en opvolging slimmer automatiseren'}.`,
    'Antwoord helder, menselijk, behulpzaam en in dezelfde taal als de klant.',
  ].filter(Boolean);

  return lines.join('\n');
}

async function scanWebsite(websiteUrl: string, goal: string): Promise<{ summary: string; snapshot: TeamBrainSnapshot }> {
  const response = await fetch(websiteUrl, {
    headers: {
      'User-Agent': 'Kyrn-Onboarding-Scanner/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error('We konden deze website niet openen. Controleer de URL en probeer opnieuw.');
  }

  const html = await response.text();
  const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description');
  const headings = pickMatches(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, 8);
  const paragraphs = pickMatches(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 8)
    .filter((item) => item.length > 30)
    .slice(0, 5);
  const highlights = [...new Set([...headings.slice(0, 4), ...paragraphs.slice(0, 3)])].slice(0, 7);
  const suggestedAudience = ['Nieuwe leads', 'Bestaande klanten', 'Terugkerende vragen'];
  const suggestedChannels = ['WhatsApp', 'Voice agents', 'Website-widget'];
  const suggestedTone = 'Professioneel, vriendelijk en direct';

  const summarySource = description || paragraphs[0] || headings[0] || title || 'Deze workspace is klaar om klantgesprekken te automatiseren.';
  const centralPrompt = buildCentralPrompt({
    title,
    description: summarySource,
    highlights,
    audience: suggestedAudience,
    goal,
  });

  return {
    summary: summarySource,
    snapshot: {
      websiteUrl,
      title,
      description,
      headings,
      highlights,
      suggestedAudience,
      suggestedChannels,
      suggestedTone,
      centralPrompt,
      scannedAt: new Date().toISOString(),
    },
  };
}

export async function GET() {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brain = await db.query.teamBrains.findFirst({
      where: eq(teamBrains.teamId, team.id),
    });

    return NextResponse.json({
      brain: brain || null,
      shouldShow: !brain?.onboardingCompletedAt && !brain?.dismissedAt,
    });
  } catch (error: any) {
    console.error('[Onboarding Brain GET]', error.message);
    return NextResponse.json({ error: 'Interne serverfout.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body?.action || 'scan';
    const now = new Date();

    if (action === 'skip') {
      const [brain] = await db
        .insert(teamBrains)
        .values({
          teamId: team.id,
          status: 'skipped',
          dismissedAt: now,
          onboardingCompletedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: teamBrains.teamId,
          set: {
            status: 'skipped',
            dismissedAt: now,
            onboardingCompletedAt: now,
            updatedAt: now,
          },
        })
        .returning();

      return NextResponse.json({ brain });
    }

    const websiteUrl = normalizeWebsiteUrl(String(body?.websiteUrl || ''));
    const goal = String(body?.goal || 'Klantgesprekken slimmer automatiseren');
    const { summary, snapshot } = await scanWebsite(websiteUrl, goal);

    const [brain] = await db
      .insert(teamBrains)
      .values({
        teamId: team.id,
        websiteUrl,
        status: 'ready',
        summary,
        snapshot,
        onboardingCompletedAt: now,
        lastScannedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: teamBrains.teamId,
        set: {
          websiteUrl,
          status: 'ready',
          summary,
          snapshot,
          onboardingCompletedAt: now,
          dismissedAt: null,
          lastScannedAt: now,
          updatedAt: now,
        },
      })
      .returning();

    return NextResponse.json({ brain });
  } catch (error: any) {
    console.error('[Onboarding Brain POST]', error.message);
    return NextResponse.json(
      { error: error.message || 'Website scannen is mislukt.' },
      { status: 400 },
    );
  }
}
