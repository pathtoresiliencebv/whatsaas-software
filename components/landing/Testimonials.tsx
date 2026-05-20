'use client';

import { Bot, MessageSquare, Zap, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const capabilities = [
  {
    icon: Bot,
    titleKey: 'testimonials.cap_1_title',
    descKey: 'testimonials.cap_1_desc',
  },
  {
    icon: MessageSquare,
    titleKey: 'testimonials.cap_2_title',
    descKey: 'testimonials.cap_2_desc',
  },
  {
    icon: Zap,
    titleKey: 'testimonials.cap_3_title',
    descKey: 'testimonials.cap_3_desc',
  },
  {
    icon: Clock,
    titleKey: 'testimonials.cap_4_title',
    descKey: 'testimonials.cap_4_desc',
  },
];

export function Testimonials() {
  const t = useTranslations('LandingPage');

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, index) => {
            const Icon = cap.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">
                  {t(cap.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(cap.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
