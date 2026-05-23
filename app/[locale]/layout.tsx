import '../../app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { getBranding } from '@/lib/db/queries/branding';
import { BrandingProvider } from '@/providers/branding-provider';
import { CallProviderWrapper } from '@/providers/call-provider-wrapper';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { FacebookSDK } from '@/components/facebook-sdk';

const manrope = Manrope({ subsets: ['latin'] });

export const viewport: Viewport = {
  maximumScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const siteName = branding?.name || 'Kyrn';
  const description = 'AI WhatsApp platform for sales and customer support. Automate conversations, scale your business, work on your rules.';

  return {
    title: siteName,
    description,
    keywords: ['WhatsApp', 'AI', 'automation', 'CRM', 'customer support', 'sales', 'business messaging'],
    authors: [{ name: 'Kyrn' }],
    openGraph: {
      title: siteName,
      description,
      url: 'https://kyrn.nl',
      siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
    },
    icons: {
      icon: branding?.faviconUrl ? `${branding.faviconUrl}?v=${new Date(branding.updatedAt).getTime()}` : '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const branding = await getBranding();
  
  const [userData, teamData] = await Promise.all([
    getUser(),
    getTeamForUser()
  ]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`bg-background text-foreground ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background">
        <FacebookSDK />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SWRConfig
              value={{
                fallback: {
                  '/api/user': userData,
                  '/api/team': teamData,
                },
              }}
            >
              <BrandingProvider branding={branding}>
                <CallProviderWrapper>
                  {children}
                  <CookieBanner />
                </CallProviderWrapper>
              </BrandingProvider>

              <Toaster
                richColors
                position="top-center"
                theme="system"
              />
            </SWRConfig>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
