'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function StepSection() {
  const t = useTranslations('LandingPage.howItWorks');
  const steps = t.raw('steps') as Array<{ title: string; description: string }>;

  return (
    <section id="how-it-works" className="py-20 px-4 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
