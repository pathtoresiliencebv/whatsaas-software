import { NextResponse } from 'next/server';
import { kyrnOpenApiSpec } from '@/lib/api/openapi';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(kyrnOpenApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  });
}
