'use client';

import Link from 'next/link';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type FeatureLockedCardProps = {
  title: string;
  description: string;
  featureLabel: string;
  examples?: string[];
};

export function FeatureLockedCard({
  title,
  description,
  featureLabel,
  examples = [],
}: FeatureLockedCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-2xl overflow-hidden border-primary/20 shadow-sm">
        <CardContent className="grid gap-0 p-0 md:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-primary/10 p-6 text-primary">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
              <Crown className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide">Betaalde functie</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              {featureLabel}
            </div>
            <p className="text-sm text-muted-foreground">
              Je hebt een betaalde functie bereikt. Wil je vandaag {featureLabel.toLowerCase()} gebruiken?
              Upgrade je plan en zet deze module direct aan.
            </p>

            {examples.length > 0 && (
              <div className="mt-5 space-y-2">
                {examples.map((example) => (
                  <div key={example} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    {example}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/pricing">
                  Plan upgraden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings/billing">Bekijk facturering</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
