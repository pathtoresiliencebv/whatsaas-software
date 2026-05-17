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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  const locale = request.nextUrl.locale || defaultLocale;
  const sessionCookie = request.cookies.get('session');

  const pathWithoutLocale = pathname.replace(/^\/(pt|en|es|nl)/, '') || '/';
  const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
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
        return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml|uploads|sounds|images).*)']
};