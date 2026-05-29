import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { signToken, verifyToken } from '@/lib/auth/session';
import { locales, defaultLocale } from '@/i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

const protectedRoutes = ['/dashboard', '/admin'];

const cookieConsentRoutes = ['/privacy', '/terms'];

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With, X-Webhook-Auth, X-Hook-Secret',
  'Access-Control-Max-Age': '86400',
};

function getPathLocale(pathname: string) {
  return locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function signInUrlFor(locale: string, request: NextRequest) {
  const path = locale === defaultLocale ? '/sign-in' : `/${locale}/sign-in`;
  return new URL(path, request.url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host')?.split(':')[0]?.toLowerCase();

  if (hostname === 'api.kyrn.nl') {
    const isCleanApiPath =
      pathname === '/v1' ||
      pathname.startsWith('/v1/') ||
      pathname === '/voice' ||
      pathname.startsWith('/voice/') ||
      pathname === '/webhook' ||
      pathname.startsWith('/webhook/') ||
      pathname === '/webhooks' ||
      pathname.startsWith('/webhooks/');

    if (request.method === 'OPTIONS' && isCleanApiPath) {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/api-docs';
      return NextResponse.rewrite(url);
    }

    if (pathname === '/openapi.json') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/openapi';
      return NextResponse.rewrite(url);
    }

    if (pathname === '/voice' || pathname.startsWith('/voice/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/api${pathname}`;
      return NextResponse.rewrite(url);
    }

    if (pathname === '/webhook' || pathname.startsWith('/webhook/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/api${pathname}`;
      return NextResponse.rewrite(url);
    }

    if (pathname === '/webhooks' || pathname.startsWith('/webhooks/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/api${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (pathname === '/v1' || pathname.startsWith('/v1/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  const pathLocale = getPathLocale(pathname);
  const pathWithoutLocale = pathLocale
    ? pathname.replace(new RegExp(`^/${pathLocale}(?=/|$)`), '') || '/'
    : pathname;

  if (pathLocale && pathWithoutLocale.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    return NextResponse.redirect(url);
  }

  if (process.env.API_ONLY_DEPLOYMENT === 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Skip middleware for static assets and excluded paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // If intlMiddleware returned a redirect, just return it
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const locale = pathLocale || defaultLocale;
  const sessionCookie = request.cookies.get('session');

  const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(signInUrlFor(locale, request));
  }

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      response.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      response.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(signInUrlFor(locale, request));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml|uploads|sounds|images).*)']
};
