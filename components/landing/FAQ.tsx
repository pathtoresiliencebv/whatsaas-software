'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FAQ() {
  const t = useTranslations('LandingPage.faq');
  const items = t.raw('items') as Array<{ question: string; answer: string }>;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-muted/30 border-t border-border scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-background rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'px-6 pb-4 text-muted-foreground',
                  openIndex === index ? 'block' : 'hidden'
                )}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
