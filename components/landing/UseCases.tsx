'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag, Building2, Rocket, Heart, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const icons = [ShoppingBag, Building2, Rocket, Heart];

export function UseCases() {
  const t = useTranslations('LandingPage.useCases');
  const cases = t.raw('items') as Array<{ title: string; description: string; features: string[] }>;

  return (
    <section className="py-24 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((useCase, index) => {
            const Icon = icons[index];
            const isLast = index === cases.length - 1;
            return (
              <Card key={index} className={`group hover:border-primary/20 hover:shadow-lg transition-all duration-300 ${isLast ? 'border-primary/20 bg-primary/5' : ''}`}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-lg font-semibold leading-tight">{useCase.title}</h3>
                    {isLast && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0 flex items-center gap-0.5">
                        <ShieldCheck className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {t('compliance_note')}
        </p>
      </div>
    </section>
  );
}
