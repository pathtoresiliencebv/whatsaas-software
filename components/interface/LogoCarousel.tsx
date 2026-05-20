'use client';

import { useTranslations } from 'next-intl';

export function LogoCarouselClient() {
  const t = useTranslations('LandingPage.social_proof');

  return (
    <div className="w-full py-12 border-y border-border/40 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
          {t('trusted_by')}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-muted-foreground/50 text-sm px-6">
        <span className="font-medium tracking-wide">{t('for_agencies')}</span>
        <span className="hidden sm:block w-px h-4 bg-border" />
        <span className="font-medium tracking-wide">{t('for_saas')}</span>
        <span className="hidden sm:block w-px h-4 bg-border" />
        <span className="font-medium tracking-wide">{t('for_services')}</span>
      </div>
    </div>
  );
}
