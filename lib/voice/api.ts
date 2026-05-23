import { NextResponse } from 'next/server';
import { checkRoutePermission } from '@/lib/auth/permissions-guard';
import type { PermissionResource } from '@/lib/permissions';

export async function requireVoicePermission(resource: PermissionResource) {
  const { context, error } = await checkRoutePermission(resource);
  if (error || !context) {
    return { error: error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { context };
}

export function jsonError(error: unknown, fallback = 'Internal server error') {
  const anyError = error as any;
  const status = anyError?.status || 500;
  return NextResponse.json({ error: anyError?.message || fallback, code: anyError?.code }, { status });
}

export async function readJson<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    return {} as T;
  }
}
