'use client';

import { useTranslations } from 'next-intl';
import { X, Check } from 'lucide-react';

export function WhyKyrn() {
  const t = useTranslations('LandingPage.whyKyrn');
  const before = t.raw('before.items') as string[];
  const after = t.raw('after.items') as string[];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-8">
            <h3 className="text-lg font-semibold mb-6 text-muted-foreground">{t('before.title')}</h3>
            <ul className="space-y-4">
              {before.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 shadow-lg shadow-primary/5">
            <h3 className="text-lg font-semibold mb-6 text-primary">{t('after.title')}</h3>
            <ul className="space-y-4">
              {after.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
