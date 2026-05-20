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

function getPathLocale(pathname: string) {
  return locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function signInUrlFor(locale: string, request: NextRequest) {
  const path = locale === defaultLocale ? '/sign-in' : `/${locale}/sign-in`;
  return new URL(path, request.url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathLocale = getPathLocale(pathname);
  const pathWithoutLocale = pathLocale
    ? pathname.replace(new RegExp(`^/${pathLocale}(?=/|$)`), '') || '/'
    : pathname;

  if (pathLocale && pathWithoutLocale.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    return NextResponse.redirect(url);
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml|uploads|sounds|images).*)']
};
