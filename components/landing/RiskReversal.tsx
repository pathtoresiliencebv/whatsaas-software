'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, RefreshCcw, Download, Clock } from 'lucide-react';

const guarantees = [
  { icon: Clock, titleKey: 'risk.trial.title', descKey: 'risk.trial.desc' },
  { icon: RefreshCcw, titleKey: 'risk.cancel.title', descKey: 'risk.cancel.desc' },
  { icon: Download, titleKey: 'risk.export.title', descKey: 'risk.export.desc' },
  { icon: ShieldCheck, titleKey: 'risk.gdpr.title', descKey: 'risk.gdpr.desc' },
];

export function RiskReversal() {
  const t = useTranslations('LandingPage');

  return (
    <section className="py-20 bg-primary/5 border-y border-primary/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('risk.title')}</h2>
          <p className="text-muted-foreground">{t('risk.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{t(item.titleKey)}</h3>
                <p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
